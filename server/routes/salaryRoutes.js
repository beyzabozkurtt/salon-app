const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');

const authMiddleware = require('../middleware/authMiddleware');

// 📌 Belirli aya göre eksik maaş kayıtlarını oluşturur (örn: 2025-07)
router.post('/generate-upcoming', authMiddleware, salaryController.generateUpcomingSalaries);

router.post("/generate", authMiddleware, salaryController.generateUpcomingSalaries);


// POST /api/salaries/generate-monthly?start=2025-07-01&end=2025-08-01
router.post('/generate-monthly', authMiddleware, salaryController.generateMonthlySalaries);


// 📥 Belirli aya ait maaşları getir (örn: /api/salaries?month=2025-07)
router.get('/', authMiddleware, salaryController.getAll);

// 🔁 Tek bir maaş kaydını yeniden hesapla
router.put('/calculate/:salaryId', authMiddleware, salaryController.calculateSalary);

// 🔁 Belirli aya ait tüm maaşları topluca yeniden hesapla (opsiyonel ama çok faydalı!)
router.put('/calculate-bulk/:month', authMiddleware, salaryController.calculateMonthlySalariesBulk);

module.exports = router;
