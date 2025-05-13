const { Payment, Sale, Customer, Service, SaleProduct, Product, User } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async getPaidCustomers(req, res) {
    try {
      const saleCustomers = await Sale.findAll({
        attributes: ['CustomerId'],
        where: { CompanyId: req.company.companyId },
        group: ['CustomerId'],
        raw: true
      });

      const ids = saleCustomers.map(c => c.CustomerId);
      const customers = await Customer.findAll({
        where: {
          id: { [Op.in]: ids },
          CompanyId: req.company.companyId
        }
      });

      res.json(customers);
    } catch (error) {
      console.error("❌ getPaidCustomers hatası:", error);
      res.status(500).json({ error: 'Müşteri listesi alınamadı.' });
    }
  },

  async getPaymentsByCustomer(req, res) {
    const customerId = parseInt(req.params.id);

    try {
      const payments = await Payment.findAll({
        where: { CompanyId: req.company.companyId },
        include: [
          { model: Sale, include: [Customer, Service] },
          { model: Product },
          { model: SaleProduct, include: [Customer] },
          { model: User }
        ],
        order: [['dueDate', 'ASC']]
      });

      const filtered = payments.filter(p =>
        p.Sale?.CustomerId === customerId || p.SaleProduct?.CustomerId === customerId
      );

      res.json(filtered);
    } catch (error) {
      console.error("❌ getPaymentsByCustomer hatası:", error);
      res.status(500).json({ error: 'Ödeme detayları alınamadı.' });
    }
  },

  async getAllPayments(req, res) {
    try {
      const payments = await Payment.findAll({
        where: { CompanyId: req.company.companyId },
        include: [
          { model: Sale, include: [Customer, Service] },
          { model: Product },
          { model: SaleProduct, include: [Customer] },
          { model: User }
        ],
        order: [['dueDate', 'ASC']]
      });

      res.json(payments);
    } catch (error) {
      console.error("❌ getAllPayments hatası:", error);
      res.status(500).json({ error: 'Tüm ödemeler alınamadı.' });
    }
  },

  async updateDueDate(req, res) {
    try {
      const payment = await Payment.findOne({
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        }
      });

      if (!payment) return res.status(404).json({ error: 'Ödeme bulunamadı' });

      payment.dueDate = req.body.newDate;
      await payment.save();

      res.json({ message: 'Tarih başarıyla güncellendi', payment });
    } catch (err) {
      console.error("❌ updateDueDate hatası:", err);
      res.status(500).json({ error: 'Tarih güncellenemedi' });
    }
  },

  async updatePayment(req, res) {
    try {
      const payment = await Payment.findOne({
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        }
      });

      if (!payment) return res.status(404).json({ error: "Ödeme bulunamadı." });

      const { dueDate, amount, status, paymentType, paymentDate, UserId } = req.body;

      if (dueDate) {
        const parsedDate = new Date(dueDate);
        if (!isNaN(parsedDate)) payment.dueDate = parsedDate;
        else return res.status(400).json({ error: "Geçersiz tarih formatı." });
      }

      if (amount !== undefined) payment.amount = amount;
      if (status) payment.status = status;
      if (paymentType) payment.paymentType = paymentType;
      if (paymentDate) payment.paymentDate = new Date(paymentDate);
      if (UserId) payment.UserId = UserId;

      await payment.save();
      res.json({ message: "Ödeme başarıyla güncellendi.", updated: payment });
    } catch (error) {
      console.error("❌ updatePayment hatası:", error);
      res.status(500).json({ error: "Ödeme güncellenemedi." });
    }
  },

  async makePayment(req, res) {
    try {
      const payment = await Payment.findOne({
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        }
      });

      if (!payment) return res.status(404).json({ error: "Taksit bulunamadı." });

      const { userId, paymentType } = req.body;

      payment.status = "ödendi";
      payment.paymentType = paymentType;
      payment.paymentDate = new Date();
      payment.UserId = userId;

      await payment.save();
      res.json({ message: "Ödeme başarıyla alındı.", updated: payment });
    } catch (err) {
      console.error("❌ makePayment hatası:", err);
      res.status(500).json({ error: "Ödeme alınamadı." });
    }
  },

  async getCashTracking(req, res) {
    try {
      let payments = await Payment.findAll({
        where: { CompanyId: req.company.companyId },
        include: [
          { model: User, attributes: ['id', 'name'] },
          {
            model: Sale,
            include: [
              { model: Customer, attributes: ['id', 'name', 'phone'] },
              { model: Service, attributes: ['id', 'name'] }
            ]
          },
          {
            model: Product,
            include: [
              {
                model: SaleProduct,
                include: [{ model: Customer, attributes: ['id', 'name', 'phone'] }]
              }
            ]
          }
        ],
        order: [['paymentDate', 'DESC']]
      });

      payments = payments.map(p => {
        if (!p.Sale && p.Product?.SaleProducts?.length > 0) {
          const sp = p.Product.SaleProducts[0];
          p.dataValues.FallbackCustomer = sp.Customer || null;
        }

        return {
          id: p.id,
          amount: p.amount,
          installmentNo: p.installmentNo,
          paymentType: p.paymentType,
          paymentDate: p.paymentDate,
          dueDate: p.dueDate,
          status: p.status,
          User: p.User,
          Product: p.Product,
          Sale: p.Sale,
          FallbackCustomer: p.dataValues.FallbackCustomer || null
        };
      });

      res.json(payments);
    } catch (error) {
      console.error("❌ getCashTracking hatası:", error);
      res.status(500).json({ error: 'Kasa takibi verileri alınamadı.' });
    }
  }
};
