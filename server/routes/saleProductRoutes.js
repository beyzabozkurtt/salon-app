const express = require('express');
const router = express.Router();
const saleProductController = require('../controllers/saleProductController');

router.get('/single/:id', saleProductController.getOne);
router.get('/', saleProductController.getAll);
router.get('/sale/:saleId', saleProductController.getBySaleId);
router.post('/', saleProductController.create); // Yeni ürün satışı (CustomerId dahil)
router.put('/:id', saleProductController.update);
router.delete('/:id', saleProductController.delete);

module.exports = router;
