const express = require('express');
const router = express.Router();
const controller = require('../controllers/userWorkingHoursController');
const authMiddleware = require('../middleware/authMiddleware'); // 🔐 Şirket doğrulama

// 🔄 KAYDET veya GÜNCELLE → /api/user-working-hours
router.post('/', authMiddleware, controller.saveWorkingHours);

// 🔍 PERSONELE AİT SAATLERİ GETİR → /api/user-working-hours/:userId
router.get('/:userId', authMiddleware, controller.getByUser);

module.exports = router;
