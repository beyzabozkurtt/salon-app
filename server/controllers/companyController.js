const { Company } = require('../models');

exports.registerCompany = async (req, res) => {
  try {
    console.log("✅ Gelen veri:", req.body); // ✨

    const { company_name, owner_name, email, phone } = req.body;

    const newCompany = await Company.create({ company_name, owner_name, email, phone });

    res.status(201).json({ message: "Şirket başarıyla oluşturuldu", companyId: newCompany.id });
  } catch (error) {
    console.error("❌ HATA:", error); // ✨ DETAYLI GÖR
    res.status(500).json({ message: "Kayıt sırasında hata oluştu", error: error.message });
  }
};

