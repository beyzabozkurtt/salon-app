const { Customer, Sale, Service, Appointment } = require('../models');
const { validationResult } = require('express-validator');

// ✅ Tüm müşterileri listele
exports.getAll = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Müşteri verileri çekilemedi' });
  }
};

// ✅ Tek müşteri getir
exports.getOne = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Müşteri bulunamadı' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Müşteri bilgisi getirilemedi' });
  }
};

// ✅ Yeni müşteri ekle
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const yeni = await Customer.create(req.body);
    res.status(201).json(yeni);
  } catch (err) {
    res.status(500).json({ error: 'Müşteri eklenemedi' });
  }
};

// ✅ Müşteri güncelle
exports.update = async (req, res) => {
  try {
    await Customer.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Müşteri güncellendi' });
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme hatası' });
  }
};

// ✅ Müşteri sil
exports.delete = async (req, res) => {
  try {
    await Customer.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Müşteri silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası' });
  }
};
exports.getCustomerPackages = async (req, res) => {
  try {
    const customerId = req.params.id;

    const sales = await Sale.findAll({
      where: { CustomerId: customerId },
      include: ['Service'],
    });

    const uniqueServices = new Map();

    for (const sale of sales) {
      const s = sale.Service;
      const existing = uniqueServices.get(s.id);

      // Daha önce eklenmişse en yüksek seansı döndür (veya topla, tercihine göre)
      if (!existing) {
        uniqueServices.set(s.id, {
          id: s.id,
          name: s.name,
          color: s.color,
          session: sale.session  // 🔥 BURASI ÇOK KRİTİK!
        });
      }
    }

    res.json(Array.from(uniqueServices.values()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Paketler getirilemedi' });
  }
};
  

// ✅ Seans detaylı müşteri detayları (Özel)
exports.getDetailsWithSessions = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findByPk(customerId);
    if (!customer) return res.status(404).json({ error: 'Müşteri bulunamadı' });

    const sales = await Sale.findAll({
      where: { CustomerId: customerId },
      include: [Service]
    });

    const results = [];

    for (const sale of sales) {
      // Tüm randevuları tarih sırasına göre al
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
        sessionCount: sale.session, // Değişmiyor
        sessions // Tarihe göre sıralı, iptaller dahil, boşlar en sona eklendi
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
