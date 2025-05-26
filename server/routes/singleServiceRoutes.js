const express = require('express');
const router = express.Router();
const singleServiceController = require('../controllers/singleServiceController');
const authMiddleware = require('../middleware/authMiddleware'); // 🔐 token kontrolü

// ✅ Tüm hizmetleri getir
router.get('/', authMiddleware, singleServiceController.getAll);

router.get('/', authMiddleware, async (req, res) => {
  try {
    const services = await SingleService.findAll({
      where: { CompanyId: req.company.companyId }
    });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hizmetler alınamadı" });
  }
});


// ✅ Yeni hizmet oluştur
router.post('/', authMiddleware, singleServiceController.create);

// ✅ Hizmet güncelle
router.put('/:id', authMiddleware, singleServiceController.update);

// ✅ Hizmet sil
router.delete('/:id', authMiddleware, singleServiceController.delete);

module.exports = router;

