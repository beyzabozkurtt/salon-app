const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const authMiddleware = require('../middleware/authMiddleware');

// 🔥 EN ÜSTTE DAİMA en spesifik olanlar
router.get('/by-customer/:id', authMiddleware, saleController.getByCustomer);
router.get('/:id/payments-status', authMiddleware, saleController.getPaymentStatus);

// 📌 Daha genel ID route en sona
router.get('/:id', authMiddleware, saleController.getOne);
router.get('/', authMiddleware, saleController.getAll);
router.post('/', authMiddleware, saleController.create);
router.put('/:id', authMiddleware, saleController.update);
router.delete('/:id', authMiddleware, saleController.delete);

module.exports = router;
