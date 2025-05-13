const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// 🟢 Giriş yapan şirketin personellerini getir
router.get('/', authMiddleware, userController.getAll);

// ➕ Personel oluştur
router.post('/', authMiddleware, userController.create);

// 🔄 Güncelle
router.put('/:id', authMiddleware, userController.update);

// 🗑️ Sil
router.delete('/:id', authMiddleware, userController.delete);

module.exports = router;
