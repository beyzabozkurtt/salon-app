const express = require('express');
const router = express.Router();
const { Product } = require('../models');

router.get('/', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

router.post('/', async (req, res) => {
  const { name, price } = req.body;
  const product = await Product.create({ name, price });
  res.json(product);
});

router.put('/:id', async (req, res) => {
  const { name, price } = req.body;
  await Product.update({ name, price }, { where: { id: req.params.id } });
  res.sendStatus(200);
});

module.exports = router;
