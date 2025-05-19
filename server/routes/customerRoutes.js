const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware'); // ✨ auth kontrolü

// ✅ Tüm müşterileri getir
router.get('/', authMiddleware, customerController.getAll);

// ✅ Tek müşteri getir
router.get('/:id', authMiddleware, customerController.getOne);

// ✅ Müşterinin satın aldığı paketleri getir
router.get('/:id/packages', authMiddleware, customerController.getCustomerPackages);

// ✅ Seanslı detaylı müşteri bilgisi
router.get('/:id/details', authMiddleware, customerController.getDetailsWithSessions);

// ✅ Yeni müşteri oluştur
router.post(
  '/',
  authMiddleware,
  [
    body('name').notEmpty().withMessage('İsim zorunludur'),
    body('phone').notEmpty().withMessage('Telefon zorunludur'),
    body('email').optional().isEmail().withMessage('Geçerli bir e-posta girin'),
    body('birthDate').optional().isISO8601().toDate().withMessage('Geçerli bir doğum tarihi girin'),
    body('gender').optional().isIn(['Kadın', 'Erkek', 'Belirtmek istemiyor']).withMessage('Geçerli bir cinsiyet seçin'),
    body('reference').optional().isString(),
    body('notes').optional().isString()
  ],
  customerController.create
);

// ✅ Mevcut müşteriyi güncelle
router.put(
  '/:id',
  authMiddleware,
  [
    body('name').notEmpty().withMessage('İsim zorunludur'),
    body('phone').notEmpty().withMessage('Telefon zorunludur'),
    body('email').optional().isEmail().withMessage('Geçerli bir e-posta girin'),
    body('birthDate').optional().isISO8601().toDate(),
    body('gender').optional().isIn(['Kadın', 'Erkek', 'Belirtmek istemiyor']),
    body('reference').optional().isString(),
    body('notes').optional().isString()
  ],
  customerController.update
);

// ✅ Müşteri sil
router.delete('/:id', authMiddleware, customerController.delete);

module.exports = router;
