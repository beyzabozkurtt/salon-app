const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware'); // 🔐

router.get('/', authMiddleware, appointmentController.getAll);
router.post('/', authMiddleware, appointmentController.create);
router.get('/:id', authMiddleware, appointmentController.getOne);
router.get('/by-customer/:id/package-usage', authMiddleware, appointmentController.getPackageUsage);
router.put('/:id', authMiddleware, appointmentController.update);
router.delete('/:id', authMiddleware, appointmentController.delete);




module.exports = router;
