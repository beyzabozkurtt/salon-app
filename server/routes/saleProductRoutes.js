const express = require('express');
const router = express.Router();
const saleProductController = require('../controllers/saleProductController');

// ✅ Tek ürün satışı (önce gelmeli!)
router.get('/single/:id', saleProductController.getOne);

// ✅ Tüm ürün satışları (liste sayfası için)
router.get('/', async (req, res) => {
  const { SaleProduct, Product, User } = require('../models');
  try {
    const items = await SaleProduct.findAll({ include: [Product, User] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Tüm ürün satışları alınamadı.' });
  }
});

// ✅ Belirli satışa ait ürünler
router.get('/:saleId', saleProductController.getBySaleId);

// ✅ Yeni ürün satışı
router.post('/', saleProductController.create);

// ✅ Ürün satışı güncelle
router.put('/:id', saleProductController.update);

// ✅ Ürün satışı sil
router.delete('/:id', saleProductController.delete);

module.exports = router;
