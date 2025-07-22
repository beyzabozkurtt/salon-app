const { Op } = require('sequelize');
const { Sale, SaleProduct, SaleSingleService, Payment, Expense } = require('../models');

const getSalesReport = async (req, res) => {
  const companyId = req.company.companyId;
  const { start, end } = req.query;

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const result = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const nextDay = new Date(d);
      nextDay.setDate(currentDate.getDate() + 1);

      const hizmet = await SaleSingleService.sum('price', {
        where: {
          CompanyId: companyId,
          createdAt: { [Op.gte]: currentDate, [Op.lt]: nextDay },
        }
      });

      const paket = await Sale.sum('price', {
        where: {
          CompanyId: companyId,
          createdAt: { [Op.gte]: currentDate, [Op.lt]: nextDay },
          ServiceId: { [Op.ne]: null }
        }
      });

      const ürün = await SaleProduct.sum('price', {
        where: {
          CompanyId: companyId,
          createdAt: { [Op.gte]: currentDate, [Op.lt]: nextDay }
        }
      });

      const tahsil = await Payment.sum('amount', {
        where: {
          CompanyId: companyId,
          paymentDate: { [Op.gte]: currentDate, [Op.lt]: nextDay },
          status: 'ödendi'
        }
      });

      const masraf = await Expense.sum('amount', {
        where: {
          CompanyId: companyId,
          expenseDate: { [Op.gte]: currentDate, [Op.lt]: nextDay }
        }
      });

      const toplam = (hizmet || 0) + (paket || 0) + (ürün || 0);

      result.push({
        tarih: currentDate.toISOString().split('T')[0],
        gun: currentDate.toLocaleDateString('tr-TR', { weekday: 'long' }),
        hizmet: hizmet || 0,
        paket: paket || 0,
        urun: ürün || 0,
        toplam,
        tahsil: tahsil || 0,
        masraf: masraf || 0
      });
    }

    res.json(result);
  } catch (err) {
    console.error("❌ Günlük satış raporu hatası:", err);
    res.status(500).json({ error: 'Satış raporu alınamadı.' });
  }
};

module.exports = { getSalesReport };
