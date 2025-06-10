const { Appointment, Customer, User, Service, Sale, SaleSingleService,SingleService, Payment } = require('../models');
const { Op } = require('sequelize');

module.exports = {
async getAll(req, res) {
  try {
    const data = await Appointment.findAll({
      where: { CompanyId: req.company.companyId },
      include: [
        Customer,
        User,
        {
          model: Service,
          attributes: ['id', 'name', 'color']
        },
        {
          model: SingleService,
          as: 'SingleService',
          attributes: ['id', 'name', 'color']
        },
        {
          model: SaleSingleService,
          attributes: ['price'],
          include: [
            {
              model: require('../models').Payment,
              attributes: ['status', 'dueDate', 'paymentDate']
            }
          ]
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
      date,             // ISO formatlı: "2025-06-04T08:00:00"
      endDate,
      price,
      notes,
    } = req.body;

    // ⏰ Geçmiş tarih ve saat kontrolü
    if (!date || isNaN(new Date(date))) {
      return res.status(400).json({ error: "Geçerli bir tarih girilmedi." });
    }

    const startDateTime = new Date(date);
    const now = new Date();

    console.log("📅 Randevu zamanı:", startDateTime.toISOString());
    console.log("🕒 Şu an:", now.toISOString());

    if (startDateTime.getTime() <= now.getTime()) {
      return res.status(400).json({ error: "Geçmiş bir saate randevu oluşturulamaz." });
    }

    // 🔢 Seans numarası sadece paketli hizmetlerde hesaplanır
// 🔢 Seans numarası sadece paketli hizmetlerde hesaplanır
let sessionNumber = 1;
if (ServiceId && !SingleServiceId) {
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


    // 💾 SaleSingleService kaydı
    const sale = await SaleSingleService.create({
      CustomerId,
      CompanyId,
      UserId,
      ServiceId: ServiceId || null,
      SingleServiceId: SingleServiceId || null,
      price: price
    });

    // 💾 Appointment kaydı
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

    // 💾 Payment kaydı
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
          { model: SingleService, as: 'SingleService' },
          { model: User },
          {
            model: SaleSingleService,
            include: [{ model: SingleService }]
          }
        ],
        order: [['date', 'ASC']]
      });

      const enriched = allAppointments.map((app, _, arr) => {
        const matching = arr.filter(a =>
          a.ServiceId === app.ServiceId &&
          a.SaleId === app.SaleId
        ).sort((a, b) => new Date(a.date) - new Date(b.date));

        const sessionNumber = app.ServiceId
          ? matching.findIndex(a => a.id === app.id) + 1
          : 1;

        return {
          ...app.toJSON(),
          sessionNumber,
          price: app.SaleSingleService?.price || 0 // 💰 fiyat bilgisi buradan
        };
      });

      res.json(enriched);
    } catch (err) {
      console.error("Paket kullanımı hatası:", err);
      res.status(500).json({ error: "Paket kullanımları alınamadı." });
    }
  },

async createFromPackage(req, res) {
  try {
    const CompanyId = req.company.companyId;
    const { SaleId, CustomerId, date, endDate, notes } = req.body;

    if (!SaleId || !CustomerId || !date || !endDate) {
      return res.status(400).json({ error: "Eksik parametre gönderildi." });
    }

    const sale = await Sale.findOne({
      where: { id: SaleId, CustomerId, CompanyId },
    });

    if (!sale) {
      return res.status(404).json({ error: "Paket satışı bulunamadı." });
    }

    const { ServiceId, UserId } = sale;

    if (!ServiceId || !UserId) {
      return res.status(400).json({ error: "Satışta ServiceId veya UserId eksik." });
    }

    // 🔍 Personel çakışma kontrolü
    const conflict = await Appointment.findOne({
      where: {
        CompanyId,
        UserId,
        status: { [Op.ne]: "iptal" },
        date: { [Op.lt]: endDate },
        endDate: { [Op.gt]: date }
      }
    });

    if (conflict) {
      return res.status(409).json({
        error: "Seçilen personelin bu saat aralığında başka bir randevusu var."
      });
    }

    const sessionCount = await Appointment.count({
      where: {
        CompanyId,
        CustomerId,
        ServiceId,
        SaleId,
        status: { [Op.ne]: "iptal" }
      }
    });

    const sessionNumber = sessionCount + 1;

    const appointment = await Appointment.create({
      CustomerId,
      CompanyId,
      ServiceId,
      SaleId,
      UserId, // Paket satışındaki personel
      date,
      endDate,
      status: "bekliyor",
      sessionNumber,
      notes
    });

    res.status(201).json(appointment);

  } catch (err) {
    console.error("❌ Paketli randevu oluşturma hatası:", err);
    res.status(500).json({ error: "Paketli randevu oluşturulamadı." });
  }
},

async checkAppointmentOverlaps(req, res) {
  try {
    const CompanyId = req.company.companyId;
    const { CustomerId, UserId, date, endDate } = req.body;

    if (!CustomerId || !UserId || !date || !endDate) {
      return res.status(400).json({ error: "Eksik parametreler gönderildi." });
    }

    // ✅ Müşteri çakışma kontrolü
    const customerOverlap = await Appointment.findOne({
      where: {
        CompanyId,
        CustomerId,
        status: { [Op.ne]: "iptal" },
        date: { [Op.lt]: endDate },
        endDate: { [Op.gt]: date }
      }
    });

    // ✅ Personel çakışma kontrolü (hizmet tipi fark etmeksizin)
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
