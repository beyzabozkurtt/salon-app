const { Appointment, Customer, User, Service } = require('../models');

module.exports = {
  // ✅ Tüm randevuları getir (seans numarası dahil)
  async getAll(req, res) {
    try {
      const data = await Appointment.findAll({
        include: [Customer, User, Service],
        order: [['date', 'ASC']]
      });

      // Seans numaralarını hesapla
      const enriched = data.map((app, _, all) => {
        const matchingAppointments = all.filter(a =>
          a.CustomerId === app.CustomerId &&
          a.ServiceId === app.ServiceId &&
          a.status !== 'iptal' &&
          new Date(a.date) <= new Date(app.date)
        ).sort((a, b) => new Date(a.date) - new Date(b.date));

        const sessionNumber = matchingAppointments.findIndex(a => a.id === app.id) + 1;

        return {
          ...app.toJSON(),
          sessionNumber
        };
      });

      res.json(enriched);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Listeleme hatası' });
    }
  },

  // ✅ Yeni randevu oluştur
  async create(req, res) {
    try {
      const { date, endDate, CustomerId, UserId, ServiceId, notes, status } = req.body;

      const appointment = await Appointment.create({
        date,
        endDate,
        CustomerId,
        UserId,
        ServiceId,
        notes,
        status: status || 'bekliyor'
      });

      res.json(appointment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Kayıt hatası' });
    }
  },

  // ✅ Randevu güncelle
  async update(req, res) {
    try {
      const { date, endDate, CustomerId, UserId, ServiceId, notes, status } = req.body;

      const updated = await Appointment.update(
        { date, endDate, CustomerId, UserId, ServiceId, notes, status },
        { where: { id: req.params.id } }
      );

      if (updated[0] === 0) {
        return res.status(404).json({ error: 'Güncellenecek randevu bulunamadı' });
      }

      res.json({ message: 'Güncellendi' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Güncelleme hatası' });
    }
  },

  // ✅ Randevu sil
  async delete(req, res) {
    try {
      const deleted = await Appointment.destroy({ where: { id: req.params.id } });

      if (deleted === 0) {
        return res.status(404).json({ error: 'Silinecek randevu bulunamadı' });
      }

      res.json({ message: 'Silindi' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Silme hatası' });
    }
  },

  // ✅ Belirli randevuyu getir
  async getOne(req, res) {
    try {
      const appointment = await Appointment.findByPk(req.params.id, {
        include: [Customer, User, Service],
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Randevu bulunamadı' });
      }

      // Seans numarası hesapla
      const allAppointments = await Appointment.findAll({
        where: {
          CustomerId: appointment.CustomerId,
          ServiceId: appointment.ServiceId,
          status: { [require('sequelize').Op.ne]: 'iptal' }
        },
        order: [['date', 'ASC']]
      });

      const sessionNumber = allAppointments.findIndex(a => a.id === appointment.id) + 1;

      res.json({
        id: appointment.id,
        date: appointment.date,
        endDate: appointment.endDate,
        Customer: appointment.Customer,
        User: appointment.User,
        Service: appointment.Service,
        notes: appointment.notes,
        status: appointment.status,
        sessionNumber
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Detay çekme hatası' });
    }
  }
};
