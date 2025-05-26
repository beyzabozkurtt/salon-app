const { Sale, Customer, User, Service, Payment } = require('../models');

module.exports = {
  async getAll(req, res) {
    try {
      const sales = await Sale.findAll({
        where: { CompanyId: req.company.companyId },
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
      const sale = await Sale.findOne({
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        },
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
      const sale = await Sale.create({
        ...req.body,
        CompanyId: req.company.companyId
      });

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
            status: 'bekliyor',
            CompanyId: req.company.companyId
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
      await Sale.update(req.body, {
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        }
      });
      res.json({ message: 'Satış güncellendi' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Güncelleme hatası' });
    }
  },

  async getPaymentStatus(req, res) {
    try {
      const sale = await Sale.findOne({
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        },
        include: [Customer, Service]
      });

      if (!sale) {
        return res.status(404).json({ error: 'Satış bulunamadı.' });
      }

      const payments = await Payment.findAll({
        where: {
          SaleId: sale.id,
          CompanyId: req.company.companyId
        },
        order: [['installmentNo', 'ASC']]
      });

      const hasPaid = payments.some(p => p.status === 'ödendi');
      const totalPrice = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      res.json({
        odemeVar: hasPaid,
        taksitler: payments,
        customerName: sale.Customer?.name || "-",
        serviceName: sale.Service?.name || "-",
        totalPrice
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ödeme detayları alınamadı.' });
    }
  },

async delete(req, res) {
  try {
    // ÖNCE ilgili ödemeleri sil
    await Payment.destroy({
      where: {
        SaleId: req.params.id,
        CompanyId: req.company.companyId
      }
    });

    // SONRA satış kaydını sil
    await Sale.destroy({
      where: {
        id: req.params.id,
        CompanyId: req.company.companyId
      }
    });

    res.json({ message: 'Satış ve ödemeler başarıyla silindi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Silme hatası' });
  }
},

    async getByCustomer(req, res) {
    try {
      const customerId = req.params.id;
      const sales = await Sale.findAll({
        where: {
          CustomerId: customerId,
          CompanyId: req.company.companyId
        },
        include: [Service],
        order: [['createdAt', 'DESC']]
      });

      res.json(sales);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Müşteri satışları alınamadı.' });
    }
  }

  
};
