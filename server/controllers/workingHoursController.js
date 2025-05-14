const db = require('../models');

const getAll = async (req, res) => {
  try {
    const hours = await db.WorkingHours.findAll({
      where: { CompanyId: req.company.companyId }
    });
    res.json(hours);
  } catch (err) {
    console.error("Çalışma saatleri alınamadı:", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

const updateAll = async (req, res) => {
  const updates = req.body;

  try {
    for (const item of updates) {
      const [record, created] = await db.WorkingHours.findOrCreate({
        where: {
          day: item.day,
          CompanyId: req.company.companyId
        },
        defaults: {
          ...item,
          CompanyId: req.company.companyId
        }
      });

      if (!created) {
        await record.update(item);
      }
    }

    res.json({ message: "Çalışma saatleri başarıyla güncellendi." });
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

module.exports = {
  getAll,
  updateAll
};
