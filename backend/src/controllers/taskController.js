const pool = require('../config/database');

const buildTaskQuery = (filters = {}, userId = null, isAdmin = false) => {
  let where = [];
  let params = [];

  if (!isAdmin && userId) {
    where.push('t.assigned_to = ?');
    params.push(userId);
  }

  if (filters.status) {
    where.push('t.status = ?');
    params.push(filters.status);
  }
  if (filters.priority) {
    where.push('t.priority = ?');
    params.push(filters.priority);
  }
  if (filters.assigned_to) {
    where.push('t.assigned_to = ?');
    params.push(filters.assigned_to);
  }
  if (filters.search) {
    where.push('(t.title LIKE ? OR t.description LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  return { whereClause, params };
};

const getAllTasks = async (req, res) => {
  try {
    const { status, priority, assigned_to, search } = req.query;
    const isAdmin = req.user.role === 'admin';
    const { whereClause, params } = buildTaskQuery(
      { status, priority, assigned_to, search },
      req.user.id,
      isAdmin
    );

    const [tasks] = await pool.query(
      `SELECT t.*,
        u.name AS assigned_to_name, u.email AS assigned_to_email, u.department AS assigned_to_department,
        c.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN users c ON t.created_by = c.id
       ${whereClause}
       ORDER BY
         CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         t.due_date ASC,
         t.created_at DESC`,
      params
    );

    res.json({ success: true, tasks });
  } catch (error) {
    console.error('GetAllTasks error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*,
        u.name AS assigned_to_name, u.email AS assigned_to_email, u.department AS assigned_to_department,
        c.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN users c ON t.created_by = c.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = rows[0];
    if (req.user.role !== 'admin' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [comments] = await pool.query(
      `SELECT tc.*, u.name AS user_name, u.role AS user_role
       FROM task_comments tc
       JOIN users u ON tc.user_id = u.id
       WHERE tc.task_id = ?
       ORDER BY tc.created_at DESC`,
      [req.params.id]
    );

    res.json({ success: true, task: { ...task, comments } });
  } catch (error) {
    console.error('GetTaskById error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, priority, due_date, assigned_to } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, priority, due_date, assigned_to, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title.trim(), description || null, priority || 'medium', due_date || null, assigned_to || null, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Task created successfully', id: result.insertId });
  } catch (error) {
    console.error('CreateTask error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, priority, status, due_date, assigned_to } = req.body;

    const [existing] = await pool.query('SELECT id FROM tasks WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await pool.query(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        due_date = COALESCE(?, due_date),
        assigned_to = COALESCE(?, assigned_to)
       WHERE id = ?`,
      [title || null, description || null, priority || null, status || null, due_date || null, assigned_to !== undefined ? assigned_to : null, req.params.id]
    );

    res.json({ success: true, message: 'Task updated successfully' });
  } catch (error) {
    console.error('UpdateTask error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [existing] = await pool.query(
      'SELECT id, assigned_to FROM tasks WHERE id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && existing[0].assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Task status updated' });
  } catch (error) {
    console.error('UpdateTaskStatus error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('DeleteTask error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }
    await pool.query(
      'INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, comment.trim()]
    );
    res.status(201).json({ success: true, message: 'Comment added' });
  } catch (error) {
    console.error('AddComment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    const whereClause = isAdmin ? '' : 'WHERE assigned_to = ?';
    const params = isAdmin ? [] : [userId];

    const [stats] = await pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) AS \`high_priority\`,
        SUM(CASE WHEN due_date < CURDATE() AND status != 'completed' THEN 1 ELSE 0 END) AS overdue
       FROM tasks ${whereClause}`,
      params
    );

    let employeeStats = [];
    if (isAdmin) {
      const [empStats] = await pool.query(
        `SELECT u.id, u.name, u.department,
          COUNT(t.id) AS total_tasks,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed,
          SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
          SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending
         FROM users u
         LEFT JOIN tasks t ON t.assigned_to = u.id
         WHERE u.role = 'employee' AND u.is_active = 1
         GROUP BY u.id
         ORDER BY total_tasks DESC`
      );
      employeeStats = empStats;
    }

    res.json({ success: true, stats: stats[0], employeeStats });
  } catch (error) {
    console.error('GetStats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, updateTaskStatus, deleteTask, addComment, getStats };
