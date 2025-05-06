const { SaleProduct, Product, User, Customer, Payment } = require('../models');

module.exports = {
  async getAll(req, res) {
    try {
      const items = await SaleProduct.findAll({ include: [Product, User, Customer] });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: 'Ürün satışları alınamadı.' });
    }
  },

  async getBySaleId(req, res) {
    try {
      const items = await SaleProduct.findAll({
        where: { SaleId: req.params.saleId },
        include: [Product, User, Customer]
      });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: 'Ürünler getirilemedi.' });
    }
  },

  async getOne(req, res) {
    try {
      const item = await SaleProduct.findByPk(req.params.id, {
        include: [Product, User, Customer]
      });
      if (!item) return res.status(404).json({ error: "Kayıt bulunamadı." });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: 'Kayıt getirilemedi.' });
    }
  },

  async create(req, res) {
    try {
      const { ProductId, quantity, UserId, CustomerId, SaleId = null } = req.body;
      const product = await Product.findByPk(ProductId);
      if (!product) return res.status(404).json({ error: "Ürün bulunamadı." });

      const newItem = await SaleProduct.create({
        ProductId,
        quantity,
        UserId,
        SaleId,
        CustomerId,
        price: product.price
      });

      // 🧾 Ödeme kaydı oluştur (Customer varsa)
      if (CustomerId) {
        const totalAmount = parseFloat(product.price) * parseInt(quantity);
        const dueDate = new Date();

        await Payment.create({
          SaleId: SaleId,
          ProductId: ProductId, // 🟢 BURASI EKLENDİ
          installmentNo: 1,
          amount: totalAmount,
          dueDate,
          status: 'bekliyor'
        });
      }

      res.json(newItem);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ürün eklenemedi.' });
    }
  },

  async update(req, res) {
    try {
      const { quantity, UserId } = req.body;
      await SaleProduct.update(
        { quantity, UserId },
        { where: { id: req.params.id } }
      );
      res.json({ message: "Güncellendi." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Güncelleme hatası.' });
    }
  },

  async delete(req, res) {
    try {
      const item = await SaleProduct.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: "Kayıt bulunamadı." });
  
      // Ödeme kaydı da silinsin (yalnızca bağımsız ürün ödemesi için)
      const { Payment } = require('../models');
      await Payment.destroy({
        where: {
          ProductId: item.ProductId,
          SaleId: null // sadece bağımsız ürün satışları için
        }
      });
  
      await SaleProduct.destroy({ where: { id: req.params.id } });
  
      res.json({ message: 'Ürün satıştan ve ödemeden kaldırıldı' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Silme işlemi başarısız.' });
    }
  }
};
