const { Appointment, Customer, User, Service, Sale, SaleSingleService, Payment } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async getAll(req, res) {
    try {
      const data = await Appointment.findAll({
        where: { CompanyId: req.company.companyId },
        include: [Customer, User, Service],
        order: [['date', 'ASC']]
      });
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Listeleme hatası' });
    }

  },

  async create(req, res) {
        console.log("🧪 Appointment create verisi:", req.body);

    try {
      const CompanyId = req.company.companyId;
      const {
        CustomerId,
        ServiceId,        // opsiyonel (paketli hizmetler için)
        SingleServiceId,  // opsiyonel (tek seferlik hizmetler için)
        UserId,
        date,
        endDate,
        price,
        notes
      } = req.body;

      // Seans numarası sadece paketli hizmetlerde hesaplanır
      let sessionNumber = 1;

      if (ServiceId) {
        const existingCount = await Appointment.count({
          where: {
            CustomerId,
            ServiceId,
            CompanyId,
            status: { [Op.ne]: 'iptal' }
          }
        });
        sessionNumber = existingCount + 1;
      }

      // SaleSingleService kaydı
      const sale = await SaleSingleService.create({
        CustomerId,
        CompanyId,
        UserId,
        ServiceId: ServiceId || null,
        SingleServiceId: SingleServiceId || null,
        price: price
      });

      // Appointment kaydı
      const appointment = await Appointment.create({
        CustomerId,
        CompanyId,
        UserId,
        ServiceId: ServiceId || null,
        date,
        endDate,
        price,
        status: "bekliyor",
        sessionNumber,
        notes,
        SaleSingleServiceId: sale.id
      });

      // Payment kaydı
      await Payment.create({
        CustomerId,
        CompanyId,
        amount: price,
        status: "bekliyor",
        dueDate: date,
        SaleSingleServiceId: sale.id
      });

      return res.status(201).json(appointment);

    } catch (err) {
      console.error("❌ Randevu oluşturma hatası:", err);
      return res.status(500).json({ error: "Randevu oluşturulamadı." });
    }
  },

  async update(req, res) {
    try {
      const { sessionNumber, ...safeData } = req.body;

      const updated = await Appointment.update(
        { ...safeData },
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

      const serviceName = appointment.Service?.name || '-';
      const start = new Date(appointment.date);
      const end = new Date(appointment.endDate);
      const duration = Math.floor((end - start) / (1000 * 60));

      res.json({
        ...appointment.toJSON(),
        serviceName,
        duration
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Detay çekme hatası' });
    }
  },

  async getPackageUsage(req, res) {
    try {
      const companyId = req.company.companyId;
      const customerId = req.params.id;

      const allAppointments = await Appointment.findAll({
        where: {
          CustomerId: customerId,
          CompanyId: companyId,
          status: { [Op.ne]: 'iptal' }
        },
        include: ['Service'],
        order: [['date', 'ASC']]
      });

      const enriched = allAppointments.map((app, _, arr) => {
        const matching = arr.filter(a =>
          a.ServiceId === app.ServiceId &&
          a.SaleId === app.SaleId
        ).sort((a, b) => new Date(a.date) - new Date(b.date));

        const sessionNumber = matching.findIndex(a => a.id === app.id) + 1;

        return {
          ...app.toJSON(),
          sessionNumber
        };
      });

      res.json(enriched);
    } catch (err) {
      console.error("Paket kullanımı hatası:", err);
      res.status(500).json({ error: "Paket kullanımları alınamadı." });
    }
  }
};
