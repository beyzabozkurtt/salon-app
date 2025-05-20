const { SaleProduct, Product, User, Customer, Payment } = require('../models');

module.exports = {
  // 🔍 Tüm satışları getir
  async getAll(req, res) {
    try {
      const items = await SaleProduct.findAll({
        where: { CompanyId: req.company.companyId },
        include: [Product, User, Customer]
      });
      res.json(items);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ürün satışları alınamadı.' });
    }
  },

  // 🔍 Belirli bir satışa ait ürünleri getir
  async getBySaleId(req, res) {
    try {
      const items = await SaleProduct.findAll({
        where: {
          SaleId: req.params.saleId,
          CompanyId: req.company.companyId
        },
        include: [Product, User, Customer]
      });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: 'Ürünler getirilemedi.' });
    }
  },

  // 🔍 Tek kayıt getir
  async getOne(req, res) {
    try {
      const item = await SaleProduct.findOne({
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        },
        include: [Product, User, Customer]
      });
      if (!item) return res.status(404).json({ error: "Kayıt bulunamadı." });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: 'Kayıt getirilemedi.' });
    }
  },

// ➕ Yeni satış ekle
async create(req, res) {
  try {
    const {
      ProductId, quantity, price, UserId, CustomerId,
      paymentMethod, notes, SaleId = null,
      paymentCollected, saleDate
    } = req.body;

    const product = await Product.findOne({
      where: {
        id: ProductId,
        CompanyId: req.company.companyId
      }
    });
    if (!product) return res.status(404).json({ error: "Ürün bulunamadı." });

    const newItem = await SaleProduct.create({
      ProductId,
      quantity,
      price,
      UserId,
      CustomerId,
      SaleId,
      notes,
      paymentMethod,
      saleDate: saleDate || null,
      CompanyId: req.company.companyId
    });

    // 🧾 Ödeme kaydı oluştur
    if (CustomerId) {
      const totalAmount = parseFloat(price) * parseInt(quantity);
      const now = new Date();

      await Payment.create({
        SaleId,
        ProductId,
        SaleProductId: newItem.id,
        installmentNo: 1,
        amount: totalAmount,
        dueDate: now,
        status: paymentCollected === "true" ? "ödenmiş" : "bekliyor",
        paymentDate: paymentCollected === "true" ? now : null,
        paymentType: paymentCollected === "true" ? paymentMethod : null,
        CompanyId: req.company.companyId
      });
    }

    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürün satışı eklenemedi.' });
  }
},


  // 🔄 Satışı güncelle
  async update(req, res) {
    try {
      const { quantity, UserId } = req.body;
      await SaleProduct.update(
        { quantity, UserId },
        {
          where: {
            id: req.params.id,
            CompanyId: req.company.companyId
          }
        }
      );
      res.json({ message: "Satış güncellendi." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Satış güncelleme hatası.' });
    }
  },

  // 🗑️ Satışı sil
  async delete(req, res) {
    try {
      const item = await SaleProduct.findOne({
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        }
      });
      if (!item) return res.status(404).json({ error: "Satış bulunamadı." });

      await Payment.destroy({
        where: {
          SaleProductId: item.id,
          CompanyId: req.company.companyId
        }
      });

      await SaleProduct.destroy({
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        }
      });

      res.json({ message: 'Satış ve ilgili ödeme kaydı silindi.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Satış silme hatası.' });
    }
  }
};
