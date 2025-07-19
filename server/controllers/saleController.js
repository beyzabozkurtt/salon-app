const { Sale, Customer, User, Service, Payment,Prim } = require('../models');

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

    const { installment, price, prePayment } = req.body;

    const toplamTutar = parseFloat(price) || 0;
    const onOdeme = parseFloat(prePayment) || 0;
    const taksitSayisi = parseInt(installment) || 0;
    const kalanTutar = Math.max(toplamTutar - onOdeme, 0);
    const simdi = new Date();

    // 1. Ön ödeme varsa, ilk payment olarak "ödendi" durumunda ekle
    if (onOdeme > 0) {
      await Payment.create({
        SaleId: sale.id,
        installmentNo: 0,
        CustomerId: sale.CustomerId,
        UserId:sale.UserId,
        amount: onOdeme,
        paymentType: req.body.prePaymentType || null,
        dueDate: simdi,
        paymentDate: simdi,
        status: 'ödendi',
        CompanyId: req.company.companyId
      });
    }

if (kalanTutar > 0) {
  const simdi = new Date();

  if (taksitSayisi > 0) {
    const taksitTutar = parseFloat((kalanTutar / taksitSayisi).toFixed(2));
    for (let i = 0; i < taksitSayisi; i++) {
      const vadeTarihi = new Date(simdi);
      vadeTarihi.setMonth(vadeTarihi.getMonth() + i + 1); // ✅ her taksit 1 ay sonrasından başlar

      await Payment.create({
        SaleId: sale.id,
        CustomerId: sale.CustomerId,
        installmentNo: i + 1,
        amount: taksitTutar,
        UserId:sale.UserId,
        dueDate: vadeTarihi,
        status: 'bekliyor',
        CompanyId: req.company.companyId
      });
    }
  } else {
    // ✅ Taksit sayısı yoksa: kalan tutar tek parça olarak 1 ay sonraya eklenir
    const tekVade = new Date(simdi);
    tekVade.setMonth(tekVade.getMonth() + 1); // 1 ay sonrası

    await Payment.create({
      SaleId: sale.id,
      CustomerId: sale.CustomerId,
      installmentNo: 1,
      amount: kalanTutar,
      UserId:sale.UserId,
      dueDate: tekVade,
      status: 'bekliyor',
      CompanyId: req.company.companyId
    });
  }
}

// 💰 Prim oluştur
if (sale.UserId) {
  const user = await User.findByPk(sale.UserId);

  let primTutar = 0;

  if (user) {
    if (user.paketTl) {
      // TL bazlı prim
      primTutar = user.paketTl;
    } else if (user.paketYuzde) {
      // Yüzde bazlı prim
      primTutar = (toplamTutar * user.paketYuzde) / 100;
    }

    // 💾 Prim kaydı yapılacaksa
    if (primTutar > 0) {
      await Prim.create({
        amount: primTutar,
        type: "paket",
        sourceId: sale.id,
        UserId:sale.UserId,
        CompanyId: req.company.companyId
      });
    }
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
