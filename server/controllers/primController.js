// controllers/primController.js

const { Prim, User, Company } = require("../models");
const { Op } = require("sequelize");


module.exports = {
  // Prim ekleme
  async create(req, res) {
    try {
      const { amount, type, sourceId, UserId, CompanyId } = req.body;

      if (!amount || !type || !sourceId || !UserId || !CompanyId) {
        return res.status(400).json({ message: "Eksik alanlar var" });
      }

      const prim = await Prim.create({
        amount,
        type,
        sourceId,
        UserId,
        CompanyId,
      });

      res.status(201).json(prim);
    } catch (err) {
      console.error("Prim ekleme hatası:", err);
      res.status(500).json({ message: "Bir hata oluştu" });
    }
  },

  // Primleri listeleme (filtreyle birlikte)
  async getAll(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const where = {};

      if (startDate && endDate) {
        where.createdAt = {
          [require("sequelize").Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const prims = await Prim.findAll({
        where,
        include: [
          { model: User, attributes: ["id", "name"] },
          { model: Company, attributes: ["id", "name"] },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.json(prims);
    } catch (err) {
      console.error("Prim listeleme hatası:", err);
      res.status(500).json({ message: "Primler alınamadı" });
    }
  },

  // 📊 Personel bazlı maaş özeti
  async getPrimSummary(req, res) {
    const { startDate, endDate } = req.query;
    const CompanyId = req.company?.companyId;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate ve endDate zorunludur." });
    }

    try {
      const users = await User.findAll({
        where: { CompanyId, role: 'personel' },
        attributes: ['id', 'name', 'salary']
      });

      const prims = await Prim.findAll({
        where: {
          CompanyId,
          createdAt: {
            [Op.between]: [
              new Date(`${startDate}T00:00:00.000Z`),
              new Date(`${endDate}T23:59:59.999Z`)
            ]
          }
        }
      });

      const summary = users.map(user => {
        const userPrims = prims.filter(p => p.UserId === user.id);
        const hizmetPrim = userPrims.filter(p => p.type === 'hizmet').reduce((sum, p) => sum + Number(p.amount), 0);
        const urunPrim = userPrims.filter(p => p.type === 'ürün').reduce((sum, p) => sum + Number(p.amount), 0);
        const paketPrim = userPrims.filter(p => p.type === 'paket').reduce((sum, p) => sum + Number(p.amount), 0);
        const salaryAmount = Number(user.salary || 0);
        const total = salaryAmount + hizmetPrim + urunPrim + paketPrim;

        return {
          User: { id: user.id, name: user.name },
          salary: salaryAmount,
          hizmetPrim,
          urunPrim,
          paketPrim,
          total
        };
      });

      res.json(summary);
    } catch (err) {
      console.error("❌ Prim özeti hatası:", err);
      res.status(500).json({ error: "Prim özeti getirilemedi" });
    }
  },

  // Detaylı prim listesi (inceleme modali için)
async getDetails(req, res) {
  const { startDate, endDate, UserId } = req.query;
  const CompanyId = req.company?.companyId;

  if (!startDate || !endDate || !UserId) {
    return res.status(400).json({ message: "startDate, endDate ve UserId zorunludur" });
  }

  try {
    const prims = await Prim.findAll({
      where: {
        CompanyId,
        UserId,
        createdAt: {
          [Op.between]: [
            new Date(`${startDate}T00:00:00.000Z`),
            new Date(`${endDate}T23:59:59.999Z`)
          ]
        }
      },
      order: [["createdAt", "DESC"]],
    });

    const results = [];

    for (const prim of prims) {
      let item = {
        id: prim.id,
        date: prim.createdAt,
        amount: prim.amount,
        type: prim.type,
      };

      if (prim.type === "paket") {
        const sale = await require("../models").Sale.findByPk(prim.sourceId, {
          include: ["Customer"],
        });
        if (sale) {
          item.customerName = sale.Customer?.name || "-";
          item.saleAmount = sale.price;
          item.primAmount = prim.amount;

        }
      }

if (prim.type === "ürün") {
  const saleProduct = await require("../models").SaleProduct.findByPk(prim.sourceId, {
    include: ["Customer"],
  });
  if (saleProduct) {
    item.customerName = saleProduct.Customer?.name || "-";
    item.saleAmount = saleProduct.price;
    item.quantity = saleProduct.quantity;
    item.primAmount = prim.amount;
  }
}

if (prim.type === "hizmet") {
  const single = await require("../models").SaleSingleService.findByPk(prim.sourceId, {
    include: ["Customer"],
  });
  if (single) {
    item.customerName = single.Customer?.name || "-";
    item.saleAmount = single.price;
    item.primAmount = prim.amount;
  }
}


      results.push(item);
    }

    res.json(results);
  } catch (err) {
    console.error("Prim detayları alınamadı:", err);
    res.status(500).json({ message: "Prim detayları alınamadı" });
  }
},
async delete(req, res) {
  try {
    const { id } = req.params;
    const CompanyId = req.company?.companyId;

    const deleted = await Prim.destroy({
      where: {
        id,
        CompanyId
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: "Prim bulunamadı veya size ait değil." });
    }

    res.json({ message: "Prim başarıyla silindi." });
  } catch (err) {
    console.error("Prim silme hatası:", err);
    res.status(500).json({ message: "Prim silinemedi." });
  }
}


};
