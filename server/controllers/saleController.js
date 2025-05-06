const { Sale, Customer, User, Service, Payment } = require('../models');

module.exports = {
  async getAll(req, res) {
    try {
      const sales = await Sale.findAll({
        include: [Customer, User, Service],
        order: [['createdAt', 'DESC']]
      });
      res.json(sales);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Satışlar alınamadı.' });
    }
  },

  async getOne(req, res) {
    try {
      const sale = await Sale.findByPk(req.params.id, {
        include: [Customer, User, Service]
      });
      if (!sale) return res.status(404).json({ error: "Satış bulunamadı." });
      res.json(sale);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Satış detayları alınamadı." });
    }
  },

  async create(req, res) {
    try {
      const sale = await Sale.create(req.body);

      const { installment, price } = req.body;

      if (installment && price) {
        const taksitSayisi = parseInt(installment);
        const toplamTutar = parseFloat(price);
        const taksitTutar = parseFloat((toplamTutar / taksitSayisi).toFixed(2));
        const simdi = new Date();

        for (let i = 0; i < taksitSayisi; i++) {
          const vadeTarihi = new Date(simdi);
          vadeTarihi.setMonth(vadeTarihi.getMonth() + i);

          await Payment.create({
            SaleId: sale.id,
            installmentNo: i + 1,
            amount: taksitTutar,
            dueDate: vadeTarihi,
            status: 'bekliyor'
          });
        }
      }

      res.json(sale);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Satış eklenemedi.' });
    }
  },

  async update(req, res) {
    try {
      await Sale.update(req.body, { where: { id: req.params.id } });
      res.json({ message: 'Satış güncellendi' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Güncelleme hatası' });
    }
  },

  async delete(req, res) {
    try {
      await Sale.destroy({ where: { id: req.params.id } });
      res.json({ message: 'Satış silindi' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Silme hatası' });
    }
  }
};
