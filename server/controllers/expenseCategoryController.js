const { ExpenseCategory } = require('../models');

// 🔍 Kategorileri getir
exports.getAll = async (req, res) => {
  try {
    const categories = await ExpenseCategory.findAll({
      where: { CompanyId: req.company.companyId }
    });
    res.json(categories);
  } catch (err) {
    console.error("❌ Kategori alma hatası:", err);
    res.status(500).json({ error: "Kategoriler alınamadı." });
  }
};

// ➕ Yeni kategori ekle
exports.create = async (req, res) => {
  try {
    const category = await ExpenseCategory.create({
      name: req.body.name,
      CompanyId: req.company.companyId
    });
    res.status(201).json(category);
  } catch (err) {
    console.error("❌ Kategori ekleme hatası:", err);
    res.status(500).json({ error: "Kategori eklenemedi." });
  }
};
