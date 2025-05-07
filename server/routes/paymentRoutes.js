const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/customers', paymentController.getPaidCustomers);
router.get('/by-customer/:id', paymentController.getPaymentsByCustomer);
router.get('/all', paymentController.getAllPayments);
router.post('/pay/:id', paymentController.makePayment); // 💰 Ödeme alma
router.get('/cash-tracking', paymentController.getCashTracking);


router.patch('/:id', paymentController.updatePayment); // ✅ Tek ve doğru route bu

module.exports = router;
