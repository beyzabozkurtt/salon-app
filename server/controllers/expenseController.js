const { Expense, User } = require('../models');

// 🔍 Tüm masrafları getir (şirkete göre)
const { Op } = require("sequelize");


exports.getAll = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

  

    const where = {
      CompanyId: req.company.companyId,
    };

    if (startDate && endDate) {
      where.expenseDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const expenses = await Expense.findAll({
      where,
      include: [{ model: User, attributes: ["id", "name"] }],
      order: [["expenseDate", "DESC"]],
    });

    res.json(expenses);
  } catch (err) {
    console.error("❌ Masraf listesi hatası:", err); // Hata detaylarını da bastıralım
    res.status(500).json({ error: "Masraflar alınamadı." });
  }
};


// ➕ Yeni masraf ekle
exports.create = async (req, res) => {
  try {
    const {
      category,
      description,
      amount,
      expenseDate,
      paymentMethod,
      UserId
    } = req.body;

    const newExpense = await Expense.create({
      category,
      description,
      amount,
      expenseDate,
      paymentMethod,
      UserId: UserId || null,
      CompanyId: req.company.companyId
    });

    res.status(201).json(newExpense);
  } catch (err) {
    console.error("❌ Masraf ekleme hatası:", err);
    res.status(500).json({ error: 'Masraf eklenemedi.' });
  }
};

// 🔄 Masraf güncelle
exports.update = async (req, res) => {
  try {
    console.log("➡️ Güncelleme isteği geldi");
    console.log("🟡 Gelen ID:", req.params.id);
    console.log("🟢 Gelen veriler:", req.body);

    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        CompanyId: req.company.companyId
      }
    });

    if (!expense) {
      console.warn("⛔ Masraf bulunamadı!");
      return res.status(404).json({ error: "Masraf bulunamadı." });
    }

    console.log("🧾 Eski masraf:", expense.toJSON());

    await expense.update(req.body);

    console.log("✅ Yeni masraf:", expense.toJSON());

    res.json({ message: "Masraf güncellendi.", updated: expense });
  } catch (err) {
    console.error("❌ Güncelleme hatası:", err);
    res.status(500).json({ error: 'Masraf güncellenemedi.' });
  }
};

// 🗑️ Masraf sil
exports.delete = async (req, res) => {
  try {
    const deleted = await Expense.destroy({
      where: {
        id: req.params.id,
        CompanyId: req.company.companyId
      }
    });

    if (deleted === 0) return res.status(404).json({ error: "Silinecek masraf bulunamadı." });

    res.json({ message: "Masraf silindi." });
  } catch (err) {
    console.error("❌ Silme hatası:", err);
    res.status(500).json({ error: 'Masraf silinemedi.' });
  }
};
