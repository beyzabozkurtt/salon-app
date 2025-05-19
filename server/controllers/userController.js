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

// ➕ Yeni personel oluştur (şifresiz)
exports.create = async (req, res) => {
  try {
    const {
      name, email, phone, role, clientGender,
      salary, hizmetNakit, hizmetKart, urunNakit, urunKart, paketNakit, paketKart
    } = req.body;

    const parsedSalary = salary === '' ? null : parseFloat(salary);

    const newUser = await User.create({
      name,
      email,
      phone,
      role,
      clientGender,
      salary: parsedSalary,
      hizmetNakit,
      hizmetKart,
      urunNakit,
      urunKart,
      paketNakit,
      paketKart,
      CompanyId: req.company.companyId
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error("❌ Kullanıcı ekleme hatası:", err);
    res.status(500).json({ error: 'Kullanıcı eklenemedi' });
  }
};


// 🔄 Kullanıcı güncelle (şirket kontrolü dahil)
exports.update = async (req, res) => {
  try {
    await User.update(req.body, {
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

// 🗑️ Kullanıcı sil (şirkete aitse)
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
