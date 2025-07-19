

const { SaleSingleService, Appointment, Payment, User, Prim } = require("../models");
const { Op } = require("sequelize");

exports.create = async (req, res) => {
  try {
    const { CustomerId, SingleServiceId, UserId, date, endDate, price, notes } = req.body;
    const CompanyId = req.company.companyId;

    const appointmentDate = new Date(date);
    const now = new Date();

    if (!date || isNaN(appointmentDate)) {
      return res.status(400).json({ error: "Geçerli bir tarih girilmedi." });
    }

    if (appointmentDate.getTime() <= now.getTime()) {
      return res.status(400).json({ error: "Geçmiş bir saate randevu oluşturulamaz." });
    }

    // 1. SaleSingleService oluştur
    const sale = await SaleSingleService.create({
      CustomerId,
      SingleServiceId,
      UserId,
      price,
      CompanyId
    });

// 💰 Prim oluştur
if (UserId) {
  const user = await User.findByPk(sale.UserId);

  let primTutar = 0;

  if (user) {
    if (user.hizmetTl) {
      // TL bazlı prim
      primTutar = user.hizmetTl;
    } else if (user.hizmetYuzde) {
      // Yüzde bazlı prim
      primTutar = (price * user.hizmetYuzde) / 100;
    }

    // 💾 Prim kaydı yapılacaksa
    if (primTutar > 0) {
      await Prim.create({
        amount: primTutar,
        type: "hizmet",
        sourceId: sale.id,
        UserId,
        CompanyId: req.company.companyId
      });
    }
  }
}

    // 2. Appointment oluştur
    const appointment = await Appointment.create({
      CustomerId,
      UserId,
      SingleServiceId: SingleServiceId || null,
      date,
      endDate,
      status: "bekliyor",
      notes,
      sessionNumber: 1,
      CompanyId,
      SaleSingleServiceId: sale.id
    });

    // 2.5: Sale kaydına AppointmentId'yi bağla
    sale.AppointmentId = appointment.id;
    await sale.save();

    // 3. Payment oluştur
    await Payment.create({
      amount: price,
      dueDate: new Date(date),
      status: "bekliyor",
      CustomerId,
      UserId,
      CompanyId,
      SaleSingleServiceId: sale.id
    });

    res.status(201).json({
      message: "Satış + Randevu + Ödeme + Prim başarıyla oluşturuldu",
      sale,
      appointment
    });

  } catch (err) {
    console.error("❌ SaleSingleService tam kayıt hatası:", err);
    res.status(500).json({ message: "İşlem sırasında bir hata oluştu." });
  }
};


exports.getAll = async (req, res) => {
  try {
    const records = await SaleSingleService.findAll();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Kayıtlar alınamadı." });
  }
};
