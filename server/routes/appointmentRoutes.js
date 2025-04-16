const express = require('express');
const router = express.Router();
const { Appointment, Customer, User, Service } = require('../models');

router.get('/', async (req, res) => {
  try {
    const data = await Appointment.findAll({
      include: [Customer, User, Service]
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Listeleme hatası' });
  }
});

router.post('/', async (req, res) => {
    try {
      const appointment = await Appointment.create({
        date: req.body.date,
        CustomerId: req.body.CustomerId,
        UserId: req.body.UserId,
        ServiceId: req.body.ServiceId
      });
      res.json(appointment);
    } catch (err) {
      res.status(500).json({ error: 'Kayıt hatası' });
    }
  });
  
router.put('/:id', async (req, res) => {
  try {
    await Appointment.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Güncellendi' });
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme hatası' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Appointment.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası' });
  }
});
// GET → Belirli bir randevuyu ID ile getir
router.get('/:id', async (req, res) => {
    try {
      const appointment = await Appointment.findByPk(req.params.id, {
        include: [Customer, User, Service]
      });
  
      if (!appointment) {
        return res.status(404).json({ error: 'Randevu bulunamadı' });
      }
  
      // ❗️Hiç Date'e çevirme — direkt string döndür
      const response = {
        id: appointment.id,
        date: appointment.date, // bu DATETIME tipindeki değeri string döndürür
        Customer: appointment.Customer,
        User: appointment.User,
        Service: appointment.Service
      };
  
      res.json(response);
    } catch (err) {
      res.status(500).json({ error: 'Detay çekme hatası' });
    }
  });
  

module.exports = router;
