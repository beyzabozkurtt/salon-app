const { Appointment, Customer, User, Service } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // ✅ Tüm randevuları getir (şirkete göre filtreli + seans numaralı)
  async getAll(req, res) {
    try {
      const data = await Appointment.findAll({
        where: { CompanyId: req.company.companyId },
        include: [Customer, User, Service],
        order: [['date', 'ASC']]
      });

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
      const appointment = await Appointment.create({
        ...req.body,
        status: req.body.status || 'bekliyor',
        CompanyId: req.company.companyId
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
      const updated = await Appointment.update(
        { ...req.body },
        {
          where: {
            id: req.params.id,
            CompanyId: req.company.companyId
          }
        }
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
      const deleted = await Appointment.destroy({
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        }
      });

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
      const appointment = await Appointment.findOne({
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        },
        include: [Customer, User, Service],
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Randevu bulunamadı' });
      }

      const allAppointments = await Appointment.findAll({
        where: {
          CustomerId: appointment.CustomerId,
          ServiceId: appointment.ServiceId,
          CompanyId: req.company.companyId,
          status: { [Op.ne]: 'iptal' }
        },
        order: [['date', 'ASC']]
      });

      const sessionNumber = allAppointments.findIndex(a => a.id === appointment.id) + 1;

      res.json({
        ...appointment.toJSON(),
        sessionNumber
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Detay çekme hatası' });
    }
  }
};
