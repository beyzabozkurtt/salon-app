const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/customers', paymentController.getPaidCustomers);
router.get('/by-customer/:id', paymentController.getPaymentsByCustomer); // ✔️ Sadece bu route aktif kullanılacak
router.get('/all', paymentController.getAllPayments);

module.exports = router;
