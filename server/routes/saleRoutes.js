const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const authMiddleware = require('../middleware/authMiddleware'); // 🛡️ Token doğrulama

// ✅ Satışları getir (şirkete özel)
router.get('/', authMiddleware, saleController.getAll);

// ✅ Yeni satış oluştur
router.post('/', authMiddleware, saleController.create);

// ✅ Satış güncelle
router.put('/:id', authMiddleware, saleController.update);

// ✅ Satış sil
router.delete('/:id', authMiddleware, saleController.delete);

// ✅ Satış detayları
router.get('/:id', authMiddleware, saleController.getOne);

// ✅ Satışa ait ödeme durumu
router.get('/:id/payments-status', authMiddleware, saleController.getPaymentStatus);

router.get('/by-customer/:id', authMiddleware, saleController.getByCustomer);


module.exports = router;
