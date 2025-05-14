const express = require('express');
const router = express.Router();
const workingHoursController = require('../controllers/workingHoursController');
const authMiddleware = require('../middleware/authMiddleware'); // 🔐 Token kontrolü

// ✅ Şirkete ait tüm çalışma saatlerini getir
router.get('/', authMiddleware, workingHoursController.getAll);

// ✅ Şirketin çalışma saatlerini güncelle
router.put('/', authMiddleware, workingHoursController.updateAll);

module.exports = router;
