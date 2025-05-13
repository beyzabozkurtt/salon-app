const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware'); // ✨ auth kontrolü

// Listele
router.get('/', authMiddleware, customerController.getAll);

// Tek müşteri
router.get('/:id', authMiddleware, customerController.getOne);

// Müşteriye ait paketler
router.get('/:id/packages', authMiddleware, customerController.getCustomerPackages);

// Detaylı seanslı müşteri bilgisi
router.get('/:id/details', authMiddleware, customerController.getDetailsWithSessions);

// Yeni müşteri
router.post(
  '/',
  authMiddleware, // ✨ middleware burada da
  [
    body('name').notEmpty().withMessage('İsim zorunludur'),
    body('email').isEmail().withMessage('Geçerli e-posta girin'),
    body('phone').notEmpty().withMessage('Telefon zorunludur')
  ],
  customerController.create
);

// Güncelle
router.put('/:id', authMiddleware, customerController.update);

// Sil
router.delete('/:id', authMiddleware, customerController.delete);

module.exports = router;
