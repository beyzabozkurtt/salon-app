const express = require('express');
const router = express.Router();
const saleProductController = require('../controllers/saleProductController');

// Tek ürün satışı (id'ye göre)
router.get('/single/:id', saleProductController.getOne);

// Tüm ürün satışları
router.get('/', saleProductController.getAll);

// Belirli satışa ait ürünler
router.get('/sale/:saleId', saleProductController.getBySaleId);

// Yeni ürün satışı
router.post('/', saleProductController.create);

// Ürün satışı güncelle
router.put('/:id', saleProductController.update);

// Ürün satışı sil
router.delete('/:id', saleProductController.delete);

module.exports = router;
