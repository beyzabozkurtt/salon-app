const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware'); // 🔐 token kontrolü

// ✅ Tüm hizmetleri getir
router.get('/', authMiddleware, serviceController.getAll);

// ✅ Yeni hizmet oluştur
router.post('/', authMiddleware, serviceController.create);

// ✅ Hizmet güncelle
router.put('/:id', authMiddleware, serviceController.update);

// ✅ Hizmet sil
router.delete('/:id', authMiddleware, serviceController.delete);

module.exports = router;
