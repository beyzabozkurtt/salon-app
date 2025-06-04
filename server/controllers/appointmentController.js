const { Appointment, Customer, User, Service, Sale, SaleSingleService, Payment } = require('../models');
const { Op } = require('sequelize');

module.exports = {
async getAll(req, res) {
  try {
    const { Appointment, Customer, User, Service, SingleService } = require('../models');

    const data = await Appointment.findAll({
      where: { CompanyId: req.company.companyId },
      include: [
        Customer,
        User,
        Service,
        {
          model: SingleService,
          as: 'SingleService',
          attributes: ['id', 'name', 'color']
        }
      ],
      order: [['date', 'ASC']]
    });

    res.json(data);
  } catch (err) {
    console.error("📛 Appointment getAll hatası:", err);
    res.status(500).json({ error: 'Listeleme hatası' });
  }
},


  async create(req, res) {
      

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
        SingleServiceId: SingleServiceId || null,
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
      include: [
        { model: Service },
        { model: require('../models').SingleService, as: 'SingleService' },
        { model: User }
      ],
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
},
async checkAppointmentOverlaps(req, res) {
  try {
    const CompanyId = req.company.companyId;
    const {
      CustomerId,
      UserId,
      ServiceId,
      SingleServiceId,
      date,
      endDate
    } = req.body;

    if (!CustomerId || !UserId || !date || !endDate) {
      return res.status(400).json({ error: "Eksik parametreler gönderildi." });
    }

    let customerOverlap = null;

    // ✅ Tek Seferlik hizmet kontrolü
    if (SingleServiceId) {
      customerOverlap = await Appointment.findOne({
        where: {
          CompanyId,
          CustomerId,
          SingleServiceId,
          status: { [Op.ne]: "iptal" },
          date: { [Op.lt]: endDate },
          endDate: { [Op.gt]: date }
        }
      });
    }

    // ✅ Eğer tek seferlikte bulunamadıysa paket hizmet kontrolü yap
    if (!customerOverlap && typeof ServiceId !== "undefined" && ServiceId !== null) {
      customerOverlap = await Appointment.findOne({
        where: {
          CompanyId,
          CustomerId,
          ServiceId,
          status: { [Op.ne]: "iptal" },
          date: { [Op.lt]: endDate },
          endDate: { [Op.gt]: date }
        }
      });
    }

    // ✅ Personel çakışması
    const personelOverlap = await Appointment.findOne({
      where: {
        CompanyId,
        UserId,
        status: { [Op.ne]: "iptal" },
        date: { [Op.lt]: endDate },
        endDate: { [Op.gt]: date }
      }
    });

    return res.json({
      customerOverlap: !!customerOverlap,
      personelOverlap: !!personelOverlap
    });

  } catch (err) {
    console.error("❌ Çakışma kontrol hatası:", err.message, err.stack);
    return res.status(500).json({ error: "Çakışma kontrolü sırasında bir hata oluştu." });
  }
}

};
