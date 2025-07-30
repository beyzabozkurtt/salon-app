const { UserWorkingHours } = require('../models');

// ⏱ Haftalık çalışma saatlerini kaydet veya güncelle
exports.saveWorkingHours = async (req, res) => {
  const { UserId, workingHours } = req.body;
  const CompanyId = req.company.companyId;

  if (!UserId || !Array.isArray(workingHours)) {
    return res.status(400).json({ error: 'Eksik veya hatalı veri gönderildi.' });
  }

  try {
    // Önce o kullanıcıya ait eski kayıtları temizle
    await UserWorkingHours.destroy({ where: { UserId, CompanyId } });

    // Gelen çalışma saatlerini yeniden oluştur
    const dataToInsert = workingHours.map(day => ({
      ...day,
      UserId,
      CompanyId
    }));

    await UserWorkingHours.bulkCreate(dataToInsert);

    res.status(200).json({ message: 'Çalışma saatleri kaydedildi.' });
  } catch (err) {
    console.error('Çalışma saatleri kaydetme hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// 🔍 Belirli bir personelin çalışma saatlerini getir
exports.getByUser = async (req, res) => {
  const { userId } = req.params;
  const CompanyId = req.company.companyId;

  try {
    const hours = await UserWorkingHours.findAll({
      where: { UserId: userId, CompanyId }
    });
    res.json(hours);
  } catch (err) {
    console.error('Çalışma saatleri çekme hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
