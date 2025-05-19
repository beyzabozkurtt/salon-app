const { Appointment, Customer, User, Service, Sale } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // ✅ Tüm randevuları getir (şirkete göre filtreli)
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

  // ✅ Yeni randevu oluştur (sessionNumber hesaplanarak)
  async create(req, res) {
    try {
      const CompanyId = req.company.companyId;
      const { CustomerId, ServiceId, SaleId } = req.body;

      const where = {
        CustomerId,
        ServiceId,
        CompanyId,
        status: { [Op.ne]: 'iptal' }
      };

      if (SaleId) where.SaleId = SaleId;

      const count = await Appointment.count({ where });

      const appointment = await Appointment.create({
        ...req.body,
        CompanyId,
        status: req.body.status || 'bekliyor',
        sessionNumber: count + 1
      });

      res.json(appointment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Kayıt hatası' });
    }
  },

  // ✅ Randevu güncelle (sessionNumber güncellenmesin)
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

  // ✅ Belirli randevuyu getir (paket adı + süre + personel)
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

    // ✅ Service adı doğrudan çekiliyor
    const serviceName = appointment.Service?.name || '-';

    // ✅ Süre hesaplama
    const start = new Date(appointment.date);
    const end = new Date(appointment.endDate);
    const duration = Math.floor((end - start) / (1000 * 60)); // dakika

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
      // Aynı müşteri, servis ve saleId eşleşmesine sahip olanları bul
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
