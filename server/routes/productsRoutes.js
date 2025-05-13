const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Ürünleri getir
router.get('/', authMiddleware, productController.getAll);

// Ürün oluştur
router.post('/', authMiddleware, productController.create);

// Ürün güncelle
router.put('/:id', authMiddleware, productController.update);

module.exports = router;
