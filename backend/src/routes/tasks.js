const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAllTasks, getTaskById, createTask, updateTask,
  updateTaskStatus, deleteTask, addComment, getStats
} = require('../controllers/taskController');

router.get('/stats', authenticate, getStats);
router.get('/', authenticate, getAllTasks);
router.get('/:id', authenticate, getTaskById);
router.post('/', authenticate, requireAdmin, createTask);
router.put('/:id', authenticate, requireAdmin, updateTask);
router.patch('/:id/status', authenticate, updateTaskStatus);
router.delete('/:id', authenticate, requireAdmin, deleteTask);
router.post('/:id/comments', authenticate, addComment);

module.exports = router;
