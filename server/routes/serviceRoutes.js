const express = require('express');
const router = express.Router();
const { Service } = require('../models');

router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Hizmetler getirilemedi' });
  }
});

module.exports = router;
