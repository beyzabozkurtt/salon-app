const { Company } = require('../models');
const jwt = require("jsonwebtoken");
const JWT_SECRET = "salonappsecret"; // .env'e taşıyabilirsin

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
