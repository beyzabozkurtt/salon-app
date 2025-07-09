const { Company } = require('../models');
const jwt = require("jsonwebtoken");
const JWT_SECRET = "salonappsecret"; // .env'e taşıyabilirsin

// ✅ Yeni şirket kaydı
exports.registerCompany = async (req, res) => {
  try {
    console.log("✅ Gelen veri:", req.body);
    const { company_name, owner_name, email, phone } = req.body;

    const newCompany = await Company.create({ company_name, owner_name, email, phone });

    res.status(201).json({ message: "Şirket başarıyla oluşturuldu", companyId: newCompany.id });
  } catch (error) {
    console.error("❌ HATA:", error);
    res.status(500).json({ message: "Kayıt sırasında hata oluştu", error: error.message });
  }
};

// ✅ Giriş
exports.loginCompany = async (req, res) => {
  try {
    const { email, phone } = req.body;

    const company = await Company.findOne({ where: { email, phone } });

    if (!company) {
      return res.status(401).json({ message: "Email veya telefon hatalı!" });
    }

    const token = jwt.sign(
      { companyId: company.id, companyName: company.company_name },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Giriş başarılı",
      token,
      companyId: company.id,
      companyName: company.company_name
    });
  } catch (error) {
    console.error("❌ Giriş hatası:", error);
    res.status(500).json({ message: "Giriş sırasında hata oluştu", error: error.message });
  }
};

// ✅ Maaş gününü getir
exports.getMaasGunu = async (req, res) => {
  try {
    const company = await Company.findByPk(req.company.companyId);
    if (!company) return res.status(404).json({ message: "Şirket bulunamadı" });

    res.json({ maasGunu: company.maasGunu });
  } catch (err) {
    console.error("❌ Maaş günü getirme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// ✅ Maaş gününü güncelle
exports.updateMaasGunu = async (req, res) => {
  try {
    const { maasGunu } = req.body;
    if (!maasGunu || maasGunu < 1 || maasGunu > 31) {
      return res.status(400).json({ message: "Geçerli bir gün (1-31) girin" });
    }

    await Company.update({ maasGunu }, {
      where: { id: req.company.companyId }
    });

    res.json({ message: "Maaş günü güncellendi", maasGunu });
  } catch (err) {
    console.error("❌ Maaş günü güncelleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
