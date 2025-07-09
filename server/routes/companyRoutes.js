const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middleware/authMiddleware'); // ✨ auth kontrolü

router.post('/register', companyController.registerCompany);
router.post('/login', companyController.loginCompany); // ✨ EKLENDİ

// ✅ Maaş günü verilerini çekme ve güncelleme
router.get('/maas-gunu', authMiddleware, companyController.getMaasGunu);
router.put('/maas-gunu', authMiddleware, companyController.updateMaasGunu);

module.exports = router;
