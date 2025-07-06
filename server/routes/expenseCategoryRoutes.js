const express = require('express');
const router = express.Router();
const expenseCategoryController = require('../controllers/expenseCategoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, expenseCategoryController.getAll);
router.post('/', authMiddleware, expenseCategoryController.create);

module.exports = router;
