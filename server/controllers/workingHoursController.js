const db = require('../models');

const getAll = async (req, res) => {
  const hours = await db.WorkingHours.findAll();
  res.json(hours);
};

const updateAll = async (req, res) => {
  const updates = req.body;
  try {
    for (const item of updates) {
      const [record, created] = await db.WorkingHours.findOrCreate({
        where: { day: item.day },
        defaults: item,
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
