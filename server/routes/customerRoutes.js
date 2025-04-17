const express = require('express');
const router = express.Router();
const { Customer } = require('../models');
const { body, validationResult } = require('express-validator');

// Listeleme
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Müşteri verileri çekilemedi' });
  }
});

// Yeni müşteri ekle
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('İsim zorunludur'),
    body('email').isEmail().withMessage('Geçerli e-posta girin'),
    body('phone').notEmpty().withMessage('Telefon zorunludur')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const yeni = await Customer.create(req.body);
      res.status(201).json(yeni);
    } catch (err) {
      res.status(500).json({ error: 'Müşteri eklenemedi' });
    }
  }
);

// Müşteri güncelle
router.put('/:id', async (req, res) => {
  try {
    await Customer.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Müşteri güncellendi' });
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme hatası' });
  }
});

// Müşteri sil
router.delete('/:id', async (req, res) => {
  try {
    await Customer.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Müşteri silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası' });
  }
});

module.exports = router;
