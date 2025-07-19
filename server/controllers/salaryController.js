const { Salary, Prim, User, Sale, SaleProduct, SaleSingleService ,Company} = require('../models');
const { Op } = require('sequelize');




// 📅 Her gün kontrol – Yaklaşan maaş tarihleri için salary satırı oluştur
exports.generateUpcomingSalaries = async (req, res) => {
  try {
    const CompanyId = req.company?.companyId;
    if (!CompanyId) return res.status(401).json({ error: "Şirket bilgisi alınamadı" });

    const company = await Company.findByPk(CompanyId);
    const maasGunu = company.maasGunu || 1;

    const today = new Date();
    const salaryDate = new Date(today.getFullYear(), today.getMonth() + 1, maasGunu); // bir sonraki maaş günü
    const fark = (salaryDate - today) / (1000 * 60 * 60 * 24); // gün cinsinden fark

    if (fark > 30) {
      return res.json({ message: "Henüz 30 gün öncesine gelinmedi" });
    }

    const startDate = new Date(salaryDate);
    startDate.setMonth(startDate.getMonth() - 1); // 1 ay öncesi
    const endDate = new Date(salaryDate);         // maaş tarihi

    const existing = await Salary.findAll({
      where: {
        CompanyId,
        salaryDate: endDate
      }
    });

    if (existing.length > 0) {
      return res.json({ message: "Zaten oluşturulmuş" });
    }

    // ✅ Önce salary kayıtları oluştur
    await exports.generateMonthlySalaries({
      query: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0]
      },
      company: { companyId: CompanyId }
    }, { status: () => ({ json: () => {} }) });

    // ✅ Ardından salary kayıtlarını alıp Expense tablosuna yaz
    const salaries = await Salary.findAll({
      where: { CompanyId, salaryDate: endDate }
    });

    const { Expense } = require('../models'); // Expense modelini yukarıda da tanımlayabilirsin

    for (const s of salaries) {
      await Expense.create({
        CompanyId,
        UserId: s.UserId,
        category: "Maaş",
        description: "Maaş ve Prim",
        amount: s.total,
        expenseDate: s.salaryDate,
        paymentMethod: "Banka"
      });
    }

    res.status(201).json({ message: "Maaş ve giderler oluşturuldu" });
  } catch (err) {
    console.error("📛 Maaş kayıtları oluşturulamadı:", err);
    res.status(500).json({ error: "Oluşturma sırasında hata oluştu" });
  }
};
// Yeni fonksiyon: Prim özetlerini personel bazında getir
exports.getPrimSummary = async (req, res) => {
  const { startDate, endDate } = req.query;
  const CompanyId = req.company.companyId;

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
          [Op.between]: [new Date(startDate), new Date(endDate)]
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
};



// 🎯 Belirli ay ve yıla göre tüm maaş kayıtlarını getir
exports.getAll = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
if (!startDate || !endDate) {
  return res.status(400).json({ error: "startDate ve endDate zorunludur." });
}
    const where = {};

    if (startDate && endDate) {
      where.salaryDate = {
        [Op.between]: [startDate, endDate]
      };
    }

const users = await User.findAll({
  where: { role: 'personel', CompanyId: req.company.companyId }
});

const salaries = await Salary.findAll({
  where,
  include: [User]
});

const fullList = users.map(user => {
  const kayit = salaries.find(s => s.UserId === user.id);
  if (!kayit) {
    return {
      User: user,
      salary: 0,
      urunPrim: 0,
      paketPrim: 0,
      hizmetPrim: 0,
      total: 0,
      id: null
    };
  }

  return {
    User: user,
    salary: kayit.salaryAmount || 0,
    urunPrim: kayit.urunPrim || 0,
    paketPrim: kayit.paketPrim || 0,
    hizmetPrim: kayit.hizmetPrim || 0,
    total: kayit.total || 0,
    id: kayit.id || null
  };
});

res.json(fullList);

  } catch (err) {
    console.error("❌ Maaş listesi hatası:", err);
    res.status(500).json({ error: 'Maaşlar alınamadı' });
  }
};

// 📅 Belirli ay için tüm personellerin primlerini hesapla ve salary tablosuna kaydet
exports.generateMonthlySalaries = async (req, res) => {
  try {
    const CompanyId = req.company.companyId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate ve endDate zorunludur." });
    }

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 100); // 1 gün geri git, günün sonuna ayarla


    const salaryDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    salaryDate.setHours(12, 0, 0, 0);


    const users = await User.findAll({
      where: { role: 'personel', CompanyId }
    });

    const newSalaries = [];

    for (const user of users) {
      const [urunler, paketler, hizmetler] = await Promise.all([
        SaleProduct.findAll({
          where: {
            UserId: user.id,
            createdAt: { [Op.between]: [start, end] },
            CompanyId
          }
        }),
        Sale.findAll({
          where: {
            UserId: user.id,
            createdAt: { [Op.between]: [start, end] },
            CompanyId
          }
        }),
        SaleSingleService.findAll({
          where: {
            UserId: user.id,
            createdAt: { [Op.between]: [start, end] },
            CompanyId
          }
        }),
      ]);


      // PRİM HESAPLAMALARI
// PRİM HESAPLAMALARI
const toplamUrun = urunler.reduce((sum, s) => {
  if (user.urunYuzde && user.urunYuzde > 0) {
    return sum + (s.price * user.urunYuzde / 100);
  }
  if (user.urunTl && user.urunTl > 0) {
    return sum + (user.urunTl * s.quantity);
  }
  return sum;
}, 0);

const toplamPaket = paketler.reduce((sum, s) => {
  if (user.paketYuzde) return sum + (s.price * user.paketYuzde / 100);
  if (user.paketTl) return sum + user.paketTl;
  return sum;
}, 0);

const toplamHizmet = hizmetler.reduce((sum, s) => {
  if (user.hizmetYuzde) return sum + (s.price * user.hizmetYuzde / 100);
  if (user.hizmetTl) return sum + user.hizmetTl;
  return sum;
}, 0);


      const total = (user.salary || 0) + toplamUrun + toplamPaket + toplamHizmet;

      newSalaries.push({
        UserId: user.id,
        CompanyId,
        startDate: start,
        endDate: end,
        salaryDate,
        salaryAmount: user.salary || 0,
        urunPrim: toplamUrun,
        paketPrim: toplamPaket,
        hizmetPrim: toplamHizmet,
        total
      });
    }

    // ❌ Aynı ayda kayıt varsa önce temizle
    await Salary.destroy({
      where: {
        CompanyId,
        salaryDate
      }
    });

    // 💾 Kaydet
    await Salary.bulkCreate(newSalaries);

    res.status(201).json({ message: `${newSalaries.length} kayıt oluşturuldu`, items: newSalaries });
  } catch (err) {
    console.error("📛 Aylık maaş oluşturulamadı:", err);
    res.status(500).json({ error: "Hesaplama hatası" });
  }
};



// 💰 Tek bir maaş kaydının primlerini hesapla
exports.calculateSalary = async (req, res) => {
  try {
    const { salaryId } = req.params;
    const salary = await Salary.findByPk(salaryId, { include: [User] });
    if (!salary) return res.status(404).json({ error: 'Kayıt bulunamadı' });

    const { UserId, month } = salary;
    const user = salary.User;

    const [y, m] = month.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const [urunler, paketler, hizmetler] = await Promise.all([
      SaleProduct.findAll({
        where: {
          UserId,
          createdAt: { [Op.between]: [start, end] }
        }
      }),
      Sale.findAll({
        where: {
          UserId,
          createdAt: { [Op.between]: [start, end] }
        }
      }),
      SaleSingleService.findAll({
        where: {
          UserId,
          createdAt: { [Op.between]: [start, end] }
        }
      }),
    ]);

    const toplamUrun = urunler.reduce((sum, u) =>
      sum + (user.urunPrimTipi === 'tl'
        ? (user.urunPrimDegeri || 0)
        : (u.price * (user.urunPrimDegeri || 0) / 100)), 0);

    const toplamPaket = paketler.reduce((sum, p) =>
      sum + (user.paketPrimTipi === 'tl'
        ? (user.paketPrimDegeri || 0)
        : (p.price * (user.paketPrimDegeri || 0) / 100)), 0);

    const toplamHizmet = hizmetler.reduce((sum, h) =>
      sum + (user.hizmetPrimTipi === 'tl'
        ? (user.hizmetPrimDegeri || 0)
        : (h.price * (user.hizmetPrimDegeri || 0) / 100)), 0);

    const total = (salary.salaryAmount || 0) + toplamUrun + toplamPaket + toplamHizmet;

    salary.urunPrim = toplamUrun;
    salary.paketPrim = toplamPaket;
    salary.hizmetPrim = toplamHizmet;
    salary.total = total;

    await salary.save();
    res.json(salary);
  } catch (err) {
    console.error("❌ Maaş hesaplama hatası:", err);
    res.status(500).json({ error: 'Hesaplama hatası' });
  }
};

exports.calculateMonthlySalariesBulk = async (req, res) => {
  try {
    const { month } = req.params;
    const salaries = await Salary.findAll({
      where: { month },
      include: [User]
    });

    for (const salary of salaries) {
      const fakeReq = { params: { salaryId: salary.id } };
      const fakeRes = { json: () => { }, status: () => fakeRes, send: () => { } };
      await exports.calculateSalary(fakeReq, fakeRes);
    }

    res.json({ message: `${salaries.length} maaş kaydı güncellendi.` });
  } catch (err) {
    console.error("Toplu maaş hesaplama hatası:", err);
    res.status(500).json({ error: 'Toplu hesaplama başarısız' });
  }
};

