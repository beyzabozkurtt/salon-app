const { User } = require('../models');

// 🔎 Tüm personelleri getir (şirkete özel)
exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { CompanyId: req.company.companyId }
    });
    res.json(users);
  } catch (err) {
    console.error("❌ Kullanıcı listesi hatası:", err);
    res.status(500).json({ error: 'Kullanıcılar alınamadı' });
  }
};

// ➕ Yeni personel oluştur
exports.create = async (req, res) => {
  try {
    const {
      name, email, phone, role,userGender, clientGender,
      salary,
      hizmetPrimTipi, hizmetPrimDegeri,
      urunPrimTipi, urunPrimDegeri,
      paketPrimTipi, paketPrimDegeri
    } = req.body;

    const parsedSalary = salary === '' ? null : parseFloat(salary);

    const newUser = await User.create({
      name,
      email,
      phone,
      role,
      userGender,
      clientGender,
      salary: parsedSalary,

      // ✅ prim tipi kontrolü: sadece biri yazılıyor
      hizmetTl: hizmetPrimTipi === 'tl' ? parseInt(hizmetPrimDegeri) : null,
      hizmetYuzde: hizmetPrimTipi === 'yuzde' ? parseInt(hizmetPrimDegeri) : null,

      urunTl: urunPrimTipi === 'tl' ? parseInt(urunPrimDegeri) : null,
      urunYuzde: urunPrimTipi === 'yuzde' ? parseInt(urunPrimDegeri) : null,

      paketTl: paketPrimTipi === 'tl' ? parseInt(paketPrimDegeri) : null,
      paketYuzde: paketPrimTipi === 'yuzde' ? parseInt(paketPrimDegeri) : null,

      CompanyId: req.company.companyId
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error("❌ Kullanıcı ekleme hatası:", err);
    res.status(500).json({ error: 'Kullanıcı eklenemedi' });
  }
};

// 🔄 Kullanıcı güncelle
exports.update = async (req, res) => {
  try {
    const {
      name, email, phone, role,userGender, clientGender,
      salary,
      hizmetPrimTipi, hizmetPrimDegeri,
      urunPrimTipi, urunPrimDegeri,
      paketPrimTipi, paketPrimDegeri
    } = req.body;

    await User.update({
      name,
      email,
      phone,
      role,
      userGender,
      clientGender,
      salary: salary === '' ? null : parseFloat(salary),

      hizmetTl: hizmetPrimTipi === 'tl' ? parseInt(hizmetPrimDegeri) : null,
      hizmetYuzde: hizmetPrimTipi === 'yuzde' ? parseInt(hizmetPrimDegeri) : null,

      urunTl: urunPrimTipi === 'tl' ? parseInt(urunPrimDegeri) : null,
      urunYuzde: urunPrimTipi === 'yuzde' ? parseInt(urunPrimDegeri) : null,

      paketTl: paketPrimTipi === 'tl' ? parseInt(paketPrimDegeri) : null,
      paketYuzde: paketPrimTipi === 'yuzde' ? parseInt(paketPrimDegeri) : null

    }, {
      where: {
        id: req.params.id,
        CompanyId: req.company.companyId
      }
    });

    res.json({ message: 'Kullanıcı güncellendi' });
  } catch (err) {
    console.error("❌ Güncelleme hatası:", err);
    res.status(500).json({ error: 'Güncelleme hatası' });
  }
};

// 🗑️ Kullanıcı sil
exports.delete = async (req, res) => {
  try {
    await User.destroy({
      where: {
        id: req.params.id,
        CompanyId: req.company.companyId
      }
    });

    res.json({ message: 'Kullanıcı silindi' });
  } catch (err) {
    console.error("❌ Silme hatası:", err);
    res.status(500).json({ error: 'Silme hatası' });
  }
};
