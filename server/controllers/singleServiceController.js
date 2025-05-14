const { SingleService } = require('../models');

module.exports = {
  async getAll(req, res) {
    try {
      const companyId = req.company?.companyId || req.user?.id;
      const services = await SingleService.findAll({
        where: { CompanyId: companyId }
      });
      res.json(services);
    } catch (err) {
      console.error("❌ GET ALL HATA:", err);
      res.status(500).json({ error: "Veri alınamadı" });
    }
  },

  async create(req, res) {
    try {
      const companyId = req.company?.companyId || req.user?.id;
      console.log("🟢 İstek geldi:", req.body);
      console.log("🏢 Kullanılacak Şirket ID:", companyId);

      const { name, color, price, duration } = req.body;
      const newService = await SingleService.create({
        name, color, price, duration, CompanyId: companyId
      });
      res.status(201).json(newService);
    } catch (err) {
      console.error("❌ CREATE HATA:", err);
      res.status(500).json({ error: "Hizmet oluşturulamadı", detay: err.message });
    }
  },

  async update(req, res) {
    try {
      const companyId = req.company?.companyId || req.user?.id;
      const { name, color, price, duration } = req.body;
      await SingleService.update(
        { name, color, price, duration },
        { where: { id: req.params.id, CompanyId: companyId } }
      );
      res.json({ message: "Güncellendi" });
    } catch (err) {
      console.error("❌ UPDATE HATA:", err);
      res.status(500).json({ error: "Güncellenemedi" });
    }
  },

  async delete(req, res) {
    try {
      const companyId = req.company?.companyId || req.user?.id;
      await SingleService.destroy({
        where: { id: req.params.id, CompanyId: companyId }
      });
      res.json({ message: "Silindi" });
    } catch (err) {
      console.error("❌ DELETE HATA:", err);
      res.status(500).json({ error: "Silme hatası" });
    }
  }
};
