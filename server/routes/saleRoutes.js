const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

router.get('/', saleController.getAll);
router.post('/', saleController.create);
router.put('/:id', saleController.update);
router.delete('/:id', saleController.delete);
router.get('/:id', saleController.getOne);


module.exports = router;
