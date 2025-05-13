const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

router.post('/register', companyController.registerCompany);
router.post('/login', companyController.loginCompany); // ✨ EKLENDİ

module.exports = router;
