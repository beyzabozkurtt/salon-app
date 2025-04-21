const { SaleProduct, Product, User } = require('../models');

module.exports = {
  // Belirli bir satışa ait ürünleri getir
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

  // Tek bir ürün satışını getir (ID'ye göre)
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

  // Yeni ürün satışı ekle
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
      console.log(err);
      res.status(500).json({ error: 'Ürün eklenemedi.' });
    }
  },

  // Güncelleme
  async update(req, res) {
    try {
      const { quantity, UserId } = req.body;
      await SaleProduct.update(
        { quantity, UserId },
        { where: { id: req.params.id } }
      );
      res.json({ message: "Güncellendi." });
    } catch (err) {
      res.status(500).json({ error: 'Güncelleme hatası.' });
    }
  },

  // Silme
  async delete(req, res) {
    try {
      await SaleProduct.destroy({ where: { id: req.params.id } });
      res.json({ message: 'Ürün satıştan kaldırıldı' });
    } catch (err) {
      res.status(500).json({ error: 'Silme işlemi başarısız.' });
    }
  }
};
