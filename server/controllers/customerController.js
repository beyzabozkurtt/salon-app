const { Customer, Sale, Service, Appointment } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize'); 

// ✅ Tüm müşterileri listele (şirkete özel)
exports.getAll = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: { CompanyId: req.company.companyId }
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Müşteri verileri çekilemedi' });
  }
};

// ✅ Tek müşteri getir (şirkete ait mi kontrolü yapılmalı)
exports.getOne = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        CompanyId: req.company.companyId
      }
    });
    if (!customer) return res.status(404).json({ error: 'Müşteri bulunamadı' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Müşteri bilgisi getirilemedi' });
  }
};

// ✅ Yeni müşteri ekle (şirket ID'si ekleniyor)
// ✅ Yeni müşteri ekle (şirket ID'si ekleniyor)
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const yeni = await Customer.create({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      birthDate: req.body.birthDate || null,
      gender: req.body.gender || null,
      reference: req.body.reference || null,
      notes: req.body.notes || null,
      CompanyId: req.company.companyId
    });
    res.status(201).json(yeni);
  } catch (err) {
    console.error("Müşteri ekleme hatası:", err);
    res.status(500).json({ error: 'Müşteri eklenemedi' });
  }
};

// ✅ Müşteri güncelle (şirket doğrulaması dahil)
exports.update = async (req, res) => {
  try {
    const result = await Customer.update({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      birthDate: req.body.birthDate || null,
      gender: req.body.gender || null,
      reference: req.body.reference || null,
      notes: req.body.notes || null
    }, {
      where: {
        id: req.params.id,
        CompanyId: req.company.companyId
      }
    });
    res.json({ message: 'Müşteri güncellendi' });
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme hatası' });
  }
};


// ✅ Müşteri sil (şirket kontrolüyle)
exports.delete = async (req, res) => {
  try {
    await Customer.destroy({
      where: {
        id: req.params.id,
        CompanyId: req.company.companyId
      }
    });
    res.json({ message: 'Müşteri silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası' });
  }
};
// ✅ Müşteri paketleri (Service ilişkisi garantili şekilde)
exports.getCustomerPackages = async (req, res) => {
  try {
    const customerId = req.params.id;
    const companyId = req.company.companyId;

    console.log("👉 Paket sorgusu başlatıldı. Müşteri ID:", customerId, "Şirket ID:", companyId);

    // 1. Müşteri gerçekten bu şirkete mi ait?
    const customer = await Customer.findOne({
      where: {
        id: customerId,
        CompanyId: companyId
      }
    });

    if (!customer) {
      console.warn("⛔ Yetkisiz erişim ya da müşteri yok:", customerId);
      return res.status(404).json({ error: "Müşteri bulunamadı veya yetkisiz erişim." });
    }

    // 2. Paket satışlarını çek (Service ile birlikte)
    const sales = await Sale.findAll({
      where: {
        CustomerId: customerId,
        CompanyId: companyId,
        ServiceId: { [Op.ne]: null } // sadece ServiceId olanlar
      },
      include: [{
        model: Service,
        required: true // hizmet mutlaka olsun
      }]
    });

    const uniqueServices = new Map();

    for (const sale of sales) {
      const s = sale.Service;

      if (!s) {
        console.warn("❗ Service bilgisi boş geldi! Sale ID:", sale.id);
        continue;
      }

      // aynı hizmet birden fazla kez satılmışsa sadece bir tanesini al
      if (!uniqueServices.has(s.id)) {
        uniqueServices.set(s.id, {
          saleId: sale.id,
          serviceId: s.id,
          name: s.name,
          color: s.color,
          session: sale.session
        });
      }
    }

    const response = Array.from(uniqueServices.values());

    console.log("✅ Paketler bulundu:", response.length);
    res.json(response);

  } catch (err) {
    console.error("❌ Paket çekme hatası:", err);
    res.status(500).json({ error: 'Paketler getirilemedi' });
  }
};


// ✅ Seans detaylı müşteri hizmetleri
exports.getDetailsWithSessions = async (req, res) => {
  try {
    const customerId = req.params.id;

    const customer = await Customer.findOne({
      where: {
        id: customerId,
        CompanyId: req.company.companyId
      }
    });
    if (!customer) return res.status(404).json({ error: 'Müşteri bulunamadı' });

    const sales = await Sale.findAll({
      where: { CustomerId: customerId },
      include: [Service]
    });

    const results = [];

    for (const sale of sales) {
      const appointments = await Appointment.findAll({
        where: {
          CustomerId: customerId,
          ServiceId: sale.ServiceId
        },
        order: [['date', 'ASC']]
      });

      const sessions = [];
      let aktifSayisi = 0;

      appointments.forEach((a, i) => {
        sessions.push({
          index: i + 1,
          status: a.status,
          date: a.date
        });
        if (a.status !== "iptal") aktifSayisi++;
      });

      const eksik = sale.session - aktifSayisi;

      for (let i = 0; i < eksik; i++) {
        sessions.push({
          index: sessions.length + 1,
          status: "boş",
          date: null
        });
      }

      results.push({
        serviceName: sale.Service.name,
        serviceColor: sale.Service.color,
        sessionCount: sale.session,
        sessions
      });
    }

    res.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email
      },
      services: results
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'İşlem hatası' });
  }
};
