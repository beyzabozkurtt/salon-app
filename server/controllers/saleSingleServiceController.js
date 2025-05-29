const { SaleSingleService, Appointment, Payment } = require("../models");
const { Op } = require("sequelize");

exports.create = async (req, res) => {
  try {
    const { CustomerId, SingleServiceId, UserId, date, endDate, price, notes } = req.body;
    const CompanyId = req.company.companyId;

    // 1. SaleSingleService oluştur
    const sale = await SaleSingleService.create({
      CustomerId,
      SingleServiceId,
      UserId,
      price,
      CompanyId
    });

    // 2. sessionNumber hesapla
    const count = await Appointment.count({
      where: {
        CustomerId,
        CompanyId,
        status: { [Op.ne]: "iptal" }
      }
    });

    // 3. Appointment oluştur
    const appointment = await Appointment.create({
      CustomerId,
      UserId,
      date,
      endDate,
      status: "bekliyor",
      notes,
      sessionNumber: count + 1,
      CompanyId,
      SaleSingleServiceId: sale.id
    });

    // 🔁 3.5: Sale kaydına AppointmentId'yi bağla
    sale.AppointmentId = appointment.id;
    await sale.save(); // Güncellemeyi kaydet

    // 4. Payment oluştur
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
      message: "Satış + Randevu + Ödeme başarıyla oluşturuldu",
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
