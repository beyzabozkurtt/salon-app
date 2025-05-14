const express = require('express');
const router = express.Router();
const singleServiceController = require('../controllers/singleServiceController');
const authMiddleware = require('../middleware/authMiddleware'); // 🔐 token kontrolü

// ✅ Tüm hizmetleri getir
router.get('/', authMiddleware, singleServiceController.getAll);

// ✅ Yeni hizmet oluştur
router.post('/', authMiddleware, singleServiceController.create);

// ✅ Hizmet güncelle
router.put('/:id', authMiddleware, singleServiceController.update);

// ✅ Hizmet sil
router.delete('/:id', authMiddleware, singleServiceController.delete);

module.exports = router;

