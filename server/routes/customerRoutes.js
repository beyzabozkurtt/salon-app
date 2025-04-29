const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');

// Listele
router.get('/', customerController.getAll);

// Tek müşteri
router.get('/:id', customerController.getOne);

//müşteriye ait paketler
router.get('/:id/packages', customerController.getCustomerPackages);


// Detaylı seanslı müşteri bilgisi
router.get('/:id/details', customerController.getDetailsWithSessions);

// Yeni müşteri
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('İsim zorunludur'),
    body('email').isEmail().withMessage('Geçerli e-posta girin'),
    body('phone').notEmpty().withMessage('Telefon zorunludur')
  ],
  customerController.create
);

// Güncelle
router.put('/:id', customerController.update);

// Sil
router.delete('/:id', customerController.delete);

module.exports = router;
