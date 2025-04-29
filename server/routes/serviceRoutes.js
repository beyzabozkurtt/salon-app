const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// ✅ Tüm hizmetleri getir
router.get('/', serviceController.getAll);

// ✅ Yeni hizmet oluştur
router.post('/', serviceController.create);

// ✅ Hizmet güncelle
router.put('/:id', serviceController.update);

// ✅ Hizmet sil
router.delete('/:id', serviceController.delete);

module.exports = router;
