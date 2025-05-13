const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware'); // 🔐

router.get('/customers', authMiddleware, paymentController.getPaidCustomers);
router.get('/by-customer/:id', authMiddleware, paymentController.getPaymentsByCustomer);
router.get('/all', authMiddleware, paymentController.getAllPayments);
router.post('/pay/:id', authMiddleware, paymentController.makePayment); // 💰 Ödeme alma
router.get('/cash-tracking', authMiddleware, paymentController.getCashTracking);

router.patch('/:id', authMiddleware, paymentController.updatePayment); // ✅ Tekil güncelleme

module.exports = router;
