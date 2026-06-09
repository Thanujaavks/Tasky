const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAllEmployees, getEmployeeById, createEmployee,
  updateEmployee, deleteEmployee, updateProfile
} = require('../controllers/userController');

router.get('/employees', authenticate, requireAdmin, getAllEmployees);
router.get('/employees/:id', authenticate, requireAdmin, getEmployeeById);
router.post('/employees', authenticate, requireAdmin, createEmployee);
router.put('/employees/:id', authenticate, requireAdmin, updateEmployee);
router.delete('/employees/:id', authenticate, requireAdmin, deleteEmployee);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
