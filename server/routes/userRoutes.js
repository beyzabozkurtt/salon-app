const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { User } = require('../models');

// Tüm personelleri getir
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Personeller getirilemedi' });
  }
});

// Yeni personel oluştur
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Kayıt başarısız' });
  }
});

// Personel güncelle
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Eğer şifre güncelleniyorsa hashle
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await User.update(updateData, { where: { id: req.params.id } });
    res.json({ message: 'Güncellendi' });
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme başarısız' });
  }
});

// Personel sil
router.delete('/:id', async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Silme başarısız' });
  }
});

module.exports = router;
