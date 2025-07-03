const { SaleProduct, Product, User, Customer, Payment } = require('../models');

module.exports = {
  // 🔍 Tüm satışları getir
async getAll(req, res) {
  try {
    const items = await SaleProduct.findAll({
      where: { CompanyId: req.company.companyId },
      include: [
        { model: Product, attributes: ['name'] },
        { model: User, attributes: ['name'] },
        { model: Customer, attributes: ['name'] }
      ],
      attributes: {
        exclude: ['createdAt']  // sadece updatedAt yeterli olacak
      }
    });

    // 🌟 updatedAt'i saleDate olarak dönüyoruz
    const formattedItems = items.map(item => ({
      ...item.toJSON(),
      saleDate: item.updatedAt  // 🌟 frontend'te doğrudan kullanılabilecek
    }));

    res.json(formattedItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürün satışları alınamadı.' });
  }
},

  // 🔍 Belirli bir satışa ait ürünleri getir
  async getBySaleId(req, res) {
    try {
      const items = await SaleProduct.findAll({
        where: {
          SaleId: req.params.saleId,
          CompanyId: req.company.companyId
        },
        include: [Product, User, Customer]
      });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: 'Ürünler getirilemedi.' });
    }
  },

  // 🔍 Tek kayıt getir
  async getOne(req, res) {
    try {
      const item = await SaleProduct.findOne({
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        },
        include: [Product, User, Customer]
      });
      if (!item) return res.status(404).json({ error: "Kayıt bulunamadı." });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: 'Kayıt getirilemedi.' });
    }
  },

// ➕ Yeni satış ekle
// ➕ Yeni satış ekle
async create(req, res) {
  try {
    const {
      ProductId, quantity, price, UserId, CustomerId,
      paymentMethod, notes, SaleId = null,
      paymentCollected, saleDate
    } = req.body;

    const product = await Product.findOne({
      where: {
        id: ProductId,
        CompanyId: req.company.companyId
      }
    });
    if (!product) return res.status(404).json({ error: "Ürün bulunamadı." });

// NOT: Stok konrolü
const forceSale = req.body.force || false;



// Stok kontrolü ve güncelleme
if (product.stock >= quantity) {
  // Stok yeterli: normal satış
  product.stock -= quantity;
} else if (forceSale) {
  // Stok yetersiz ama kullanıcı onayladı
  product.stock = 0;
} else {
  // Stok yetersiz ve kullanıcı onaylamadı
  return res.status(409).json({ error: "Yetersiz stok, onay gerekiyor." });
}
await product.save();


    // 🧾 Yeni satış kaydı oluştur
    const newItem = await SaleProduct.create({
      ProductId,
      quantity,
      price,
      UserId,
      CustomerId,
      SaleId,
      notes,
      paymentMethod,
      saleDate: saleDate || null,
      CompanyId: req.company.companyId
    });



    // 🧾 Ödeme oluştur
if (CustomerId) {
  const totalAmount = parseFloat(price) 
  const now = new Date();

  await Payment.create({
    SaleId,
    ProductId,
    SaleProductId: newItem.id,
    CustomerId,
    installmentNo: 1,
    amount: totalAmount,
    dueDate: now,
    status: paymentCollected ? "ödendi" : "bekliyor",
    paymentDate: paymentCollected ? now : null,
    paymentType: paymentCollected ? paymentMethod : null,
    CompanyId: req.company.companyId
  });
}


    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürün satışı eklenemedi.' });
  }
},



  // 🔄 Satışı güncelle
 // 🔄 Satışı güncelle
async update(req, res) {
  try {
    const { quantity, UserId, paymentMethod, notes, CustomerId } = req.body;

    await SaleProduct.update(
      {
        quantity,
        UserId,
        paymentMethod,
        notes,
        CustomerId
      },
      {
        where: {
          id: req.params.id,
          CompanyId: req.company.companyId
        }
      }
    );

    res.json({ message: "Satış güncellendi." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Satış güncelleme hatası.' });
  }
},

// 🗑️ Satışı sil
async delete(req, res) {
  try {
    const item = await SaleProduct.findOne({
      where: {
        id: req.params.id,
        CompanyId: req.company.companyId
      }
    });

    if (!item) return res.status(404).json({ error: "Satış bulunamadı." });

    // 📦 Stok geri artırma
    const product = await Product.findOne({
      where: {
        id: item.ProductId,
        CompanyId: req.company.companyId
      }
    });

    if (product) {
      await product.increment('stock', { by: item.quantity });
    }

    // 💸 Ödemeyi sil
    await Payment.destroy({
      where: {
        SaleProductId: item.id,
        CompanyId: req.company.companyId
      }
    });

    // 🗑️ Satışı sil
    await SaleProduct.destroy({
      where: {
        id: req.params.id,
        CompanyId: req.company.companyId
      }
    });

    res.json({ message: 'Satış, ödeme ve stok güncellemesi tamamlandı.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Satış silme hatası.' });
  }
}

};
