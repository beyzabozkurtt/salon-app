const { Product } = require('../models');

// 🔍 Şirkete ait ürünleri getir
exports.getAll = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { CompanyId: req.company.companyId }
    });
    res.json(products);
  } catch (err) {
    console.error("❌ Ürün listeleme hatası:", err);
    res.status(500).json({ error: "Ürünler alınamadı" });
  }
};

// ➕ Yeni ürün oluştur
exports.create = async (req, res) => {
  try {
    const { name, price, stock, barcode } = req.body;

    const product = await Product.create({
      name,
      price,
      stock: stock || 0,
      barcode: barcode || null,
      CompanyId: req.company.companyId
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Ürün oluşturma hatası:", err);
    res.status(500).json({ error: "Ürün eklenemedi" });
  }
};

// 🔄 Ürün güncelle
exports.update = async (req, res) => {
  try {
    const { name, price, stock, barcode } = req.body;
    const id = req.params.id;

    await Product.update(
      {
        name,
        price,
        stock: stock || 0,
        barcode: barcode || null
      },
      {
        where: {
          id,
          CompanyId: req.company.companyId
        }
      }
    );

    res.json({ message: "Ürün güncellendi" });
  } catch (err) {
    console.error("❌ Ürün güncelleme hatası:", err);
    res.status(500).json({ error: "Ürün güncellenemedi" });
  }
};

