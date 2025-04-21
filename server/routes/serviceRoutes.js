const express = require('express');
const router = express.Router();
const { Service } = require('../models');

// Tüm hizmetleri getir
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Hizmetler getirilemedi' });
  }
});

// Yeni hizmet ekle
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const service = await Service.create({ name });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: 'Hizmet eklenemedi' });
  }
});

// Hizmet güncelle
router.put('/:id', async (req, res) => {
  try {
    await Service.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Güncellendi' });
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme hatası' });
  }
});

// Hizmet sil
router.delete('/:id', async (req, res) => {
  try {
    await Service.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası' });
  }
});

module.exports = router;
