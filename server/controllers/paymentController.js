const { Payment, Sale, Customer, Service, SaleProduct, Product } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // ✔️ Satış yapılmış müşteri listesini getir
  async getPaidCustomers(req, res) {
    try {
      const customerIds = await Sale.findAll({
        attributes: ['CustomerId'],
        group: ['CustomerId'],
        raw: true
      });

      const ids = customerIds.map(c => c.CustomerId);

      const customers = await Customer.findAll({
        where: { id: { [Op.in]: ids } }
      });

      res.json(customers);
    } catch (error) {
      console.error("❌ getPaidCustomers hatası:", error);
      res.status(500).json({ error: 'Müşteri listesi alınamadı.' });
    }
  },

  // ✔️ Belirli müşterinin tüm ödeme detaylarını getir (hizmet ve ürün dahil)
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
            model: Product // Doğrudan ürünle ilişkili ödemeler
          }
        ],
        order: [['dueDate', 'ASC']]
      });

      // Sadece o müşteriye ait ödemeleri filtrele
      const filtered = payments.filter(p => {
        const saleMatch = p.Sale?.CustomerId === customerId;
        const productMatch = p.Product && p.Product.CustomerId === customerId;
        return saleMatch || productMatch;
      });

      res.json(filtered);
    } catch (error) {
      console.error("❌ getPaymentsByCustomer hatası:", error);
      res.status(500).json({ error: 'Ödeme detayları alınamadı.' });
    }
  },

  // ✔️ Tüm ödemeleri getir (admin ekranı için vs.)
  async getAllPayments(req, res) {
    try {
      const payments = await Payment.findAll({
        include: [
          {
            model: Sale,
            include: ['Customer', 'Service']
          },
          {
            model: Product
          }
        ],
        order: [['dueDate', 'ASC']]
      });

      res.json(payments);
    } catch (error) {
      console.error("❌ getAllPayments hatası:", error);
      res.status(500).json({ error: 'Tüm ödemeler alınamadı.' });
    }
  }
};
