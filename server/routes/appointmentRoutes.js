const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// ✅ Tüm randevuları getir
router.get('/', appointmentController.getAll);

// ✅ Yeni randevu oluştur
router.post('/', appointmentController.create);

// ✅ Belirli bir randevuyu getir
router.get('/:id', appointmentController.getOne);

// ✅ Randevu güncelle
router.put('/:id', appointmentController.update);

// ✅ Randevu sil
router.delete('/:id', appointmentController.delete);

module.exports = router;
