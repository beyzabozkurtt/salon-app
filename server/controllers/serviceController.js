const { Service } = require('../models');

module.exports = {
  // ✅ Tüm hizmetleri getir
  async getAll(req, res) {
    try {
      const services = await Service.findAll();
      res.json(services);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Hizmetler getirilemedi' });
    }
  },

  // ✅ Yeni hizmet oluştur
  async create(req, res) {
    try {
      const { name, color } = req.body;

      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        return res.status(400).json({ error: 'Geçersiz renk formatı' });
      }

      const service = await Service.create({ name, color });
      res.json(service);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Hizmet eklenemedi' });
    }
  },

  // ✅ Hizmeti güncelle
  async update(req, res) {
    try {
      const { name, color } = req.body;

      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        return res.status(400).json({ error: 'Geçersiz renk formatı' });
      }

      const [updated] = await Service.update(
        { name, color },
        { where: { id: req.params.id } }
      );

      if (updated === 0) {
        return res.status(404).json({ error: 'Güncellenecek hizmet bulunamadı' });
      }

      res.json({ message: 'Güncellendi' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Güncelleme hatası' });
    }
  },

  // ✅ Hizmeti sil
  async delete(req, res) {
    try {
      const deleted = await Service.destroy({ where: { id: req.params.id } });

      if (deleted === 0) {
        return res.status(404).json({ error: 'Silinecek hizmet bulunamadı' });
      }

      res.json({ message: 'Silindi' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Silme hatası' });
    }
  }
};
