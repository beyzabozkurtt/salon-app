const express = require('express');
const router = express.Router();
const { Customer } = require('../models');

// Tüm müşterileri getir
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Müşteri verileri çekilemedi' });
  }
});

module.exports = router;
