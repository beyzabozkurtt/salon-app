const express = require('express');
const router = express.Router();
const saleProductController = require('../controllers/saleProductController');
const authMiddleware = require('../middleware/authMiddleware');

// 🔍 Tek satış ürünü (şirket kontrolüyle)
router.get('/single/:id', authMiddleware, saleProductController.getOne);

// 🔍 Tüm satış ürünleri (şirkete özel)
router.get('/', authMiddleware, saleProductController.getAll);

// 🔍 Belirli satışa ait ürünler
router.get('/sale/:saleId', authMiddleware, saleProductController.getBySaleId);

// ➕ Yeni ürün satışı
router.post('/', authMiddleware, saleProductController.create);

// 🔄 Güncelleme
router.put('/:id', authMiddleware, saleProductController.update);

// 🗑️ Silme
router.delete('/:id', authMiddleware, saleProductController.delete);

module.exports = router;
