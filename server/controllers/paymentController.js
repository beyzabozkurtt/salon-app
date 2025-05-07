const { Payment, Sale, Customer, Service, SaleProduct, Product, User } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async getPaidCustomers(req, res) {
    try {
      const customerIds = await Sale.findAll({
        attributes: ['CustomerId'],
        group: ['CustomerId'],
        raw: true
      });

      const ids = customerIds.map(c => c.CustomerId);
      const customers = await Customer.findAll({ where: { id: { [Op.in]: ids } } });

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
        include: [
          {
            model: Sale,
            include: [
              { model: Customer },
              { model: Service }
            ]
          },
          {
            model: Product
          },
          {
            model: SaleProduct,
            include: [{ model: Customer }]
          },
          {
            model: User
          }
        ],
        order: [['dueDate', 'ASC']]
      });

      const filtered = payments.filter(p => {
        const fromSale = p.Sale?.CustomerId === customerId;
        const fromSP = p.SaleProduct?.CustomerId === customerId;
        return fromSale || fromSP;
      });

      res.json(filtered);
    } catch (error) {
      console.error("❌ getPaymentsByCustomer hatası:", error);
      res.status(500).json({ error: 'Ödeme detayları alınamadı.' });
    }
  },

  async getAllPayments(req, res) {
    try {
      const payments = await Payment.findAll({
        include: [
          {
            model: Sale,
            include: [
              { model: Customer },
              { model: Service }
            ]
          },
          {
            model: Product
          },
          {
            model: SaleProduct,
            include: [{ model: Customer }]
          },
          {
            model: User
          }
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
    const paymentId = req.params.id;
    const { newDate } = req.body;

    try {
      const payment = await Payment.findByPk(paymentId);
      if (!payment) return res.status(404).json({ error: 'Ödeme bulunamadı' });

      payment.dueDate = newDate;
      await payment.save();

      res.json({ message: 'Tarih başarıyla güncellendi', payment });
    } catch (err) {
      console.error("❌ updateDueDate hatası:", err);
      res.status(500).json({ error: 'Tarih güncellenemedi' });
    }
  },

  async updatePayment(req, res) {
    const paymentId = req.params.id;
    const { dueDate, amount, status, paymentType, paymentDate, UserId } = req.body;

    try {
      const payment = await Payment.findByPk(paymentId);
      if (!payment) return res.status(404).json({ error: "Ödeme bulunamadı." });

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
    const paymentId = req.params.id;
    const { userId, paymentType } = req.body;

    try {
      const payment = await Payment.findByPk(paymentId);
      if (!payment) return res.status(404).json({ error: "Taksit bulunamadı." });

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
        include: [
          {
            model: User,
            attributes: ['id', 'name']
          },
          {
            model: Sale,
            include: [
              { model: Customer, attributes: ['id', 'name', 'phone'] },
              { model: Service, attributes: ['id', 'name'] }
            ]
          },
          {
            model: Product
          },
          {
            model: SaleProduct,
            include: [
              { model: Customer, attributes: ['id', 'name'] }
            ]
          }
        ],
        order: [['paymentDate', 'DESC']]
      });

      payments = payments.map(p => {
        if (!p.Sale && p.SaleProduct?.Customer) {
          p.dataValues.FallbackCustomer = p.SaleProduct.Customer;
        }
        return p;
      });

      res.json(payments);
    } catch (error) {
      console.error("❌ getCashTracking hatası:", error);
      res.status(500).json({ error: 'Kasa takibi verileri alınamadı.' });
    }
  }
};
