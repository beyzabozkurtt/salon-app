const { SaleProduct, Product, User } = require('../models');

module.exports = {
  // Tüm ürün satışları
  async getAll(req, res) {
    try {
      const items = await SaleProduct.findAll({ include: [Product, User] });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: 'Ürün satışları alınamadı.' });
    }
  },

  // Belirli bir satışa ait ürünler
  async getBySaleId(req, res) {
    try {
      const items = await SaleProduct.findAll({
        where: { SaleId: req.params.saleId },
        include: [Product, User]
      });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: 'Ürünler getirilemedi.' });
    }
  },

  // Tek ürün satışı
  async getOne(req, res) {
    try {
      const item = await SaleProduct.findByPk(req.params.id, {
        include: [Product, User]
      });
      if (!item) return res.status(404).json({ error: "Kayıt bulunamadı." });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: 'Kayıt getirilemedi.' });
    }
  },

  // Yeni ürün satışı
  async create(req, res) {
    try {
      const { ProductId, quantity, UserId, SaleId } = req.body;
      const product = await Product.findByPk(ProductId);
      if (!product) return res.status(404).json({ error: "Ürün bulunamadı." });

      const newItem = await SaleProduct.create({
        ProductId,
        quantity,
        UserId,
        SaleId,
        price: product.price
      });

      res.json(newItem);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ürün eklenemedi.' });
    }
  },

  // Ürün satışı güncelle
  async update(req, res) {
    try {
      const { quantity, UserId } = req.body;
      await SaleProduct.update(
        { quantity, UserId },
        { where: { SaleProductId: req.params.id } } // düzeltme burada
      );
      res.json({ message: "Güncellendi." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Güncelleme hatası.' });
    }
  },

  // Ürün satışı sil
  async delete(req, res) {
    try {
      await SaleProduct.destroy({
        where: { SaleProductId: req.params.id } // düzeltme burada da
      });
      res.json({ message: 'Ürün satıştan kaldırıldı' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Silme işlemi başarısız.' });
    }
  }
};
