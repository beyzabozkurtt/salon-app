const { User } = require('../models');
const bcrypt = require('bcryptjs');

// 🔎 Tüm personelleri getir (şirkete özel)
exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { CompanyId: req.company.companyId },
      attributes: { exclude: ['password'] } // Şifre gizli kalsın
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
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      CompanyId: req.company.companyId
    });

    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error("❌ Kullanıcı ekleme hatası:", err);
    res.status(500).json({ error: 'Kullanıcı eklenemedi' });
  }
};

// 🔄 Kullanıcı güncelle (şirket kontrolü dahil)
exports.update = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const id = req.params.id;

    await User.update(
      { name, email, role },
      {
        where: {
          id,
          CompanyId: req.company.companyId
        }
      }
    );

    res.json({ message: 'Kullanıcı güncellendi' });
  } catch (err) {
    console.error("❌ Güncelleme hatası:", err);
    res.status(500).json({ error: 'Güncelleme hatası' });
  }
};

// 🗑️ Kullanıcı sil (şirkete aitse)
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    await User.destroy({
      where: {
        id,
        CompanyId: req.company.companyId
      }
    });

    res.json({ message: 'Kullanıcı silindi' });
  } catch (err) {
    console.error("❌ Silme hatası:", err);
    res.status(500).json({ error: 'Silme hatası' });
  }
};
