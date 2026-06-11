const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const getAllEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.department, u.phone, u.avatar_url, u.is_active, u.created_at,
        COUNT(t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
        SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending_tasks
      FROM users u
      LEFT JOIN tasks t ON t.assigned_to = u.id
      WHERE u.role = 'employee' AND u.is_active = 1
      GROUP BY u.id
      ORDER BY u.name ASC`
    );
    res.json({ success: true, employees: rows });
  } catch (error) {
    console.error('GetAllEmployees error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, department, phone, avatar_url, is_active, created_at
       FROM users WHERE id = ? AND role = 'employee'`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, employee: rows[0] });
  } catch (error) {
    console.error('GetEmployeeById error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, department, phone) VALUES (?, ?, ?, "employee", ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, department || null, phone || null]
    );

    res.status(201).json({ success: true, message: 'Employee created successfully', id: result.insertId });
  } catch (error) {
    console.error('CreateEmployee error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { name, department, phone, is_active } = req.body;
    await pool.query(
      'UPDATE users SET name = COALESCE(?, name), department = COALESCE(?, department), phone = COALESCE(?, phone), is_active = COALESCE(?, is_active) WHERE id = ? AND role = "employee"',
      [name || null, department || null, phone || null, is_active !== undefined ? is_active : null, req.params.id]
    );
    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (error) {
    console.error('UpdateEmployee error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active = 0 WHERE id = ? AND role = "employee"', [req.params.id]);
    res.json({ success: true, message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error('DeleteEmployee error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, department, phone, avatar_url, current_password, new_password } = req.body;
    const userId = req.user.id;

    if (new_password) {
      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
      const isMatch = await bcrypt.compare(current_password, rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      const hashed = await bcrypt.hash(new_password, 12);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    }

    await pool.query(
      'UPDATE users SET name = COALESCE(?, name), department = COALESCE(?, department), phone = COALESCE(?, phone), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
      [name || null, department || null, phone || null, avatar_url || null, userId]
    );

    const [updated] = await pool.query(
      'SELECT id, name, email, role, department, phone, avatar_url FROM users WHERE id = ?',
      [userId]
    );
    res.json({ success: true, message: 'Profile updated successfully', user: updated[0] });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, updateProfile };
