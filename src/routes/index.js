const express = require('express');
const categoriesRouter = require('./categories');
const productsRouter = require('./products');
const stockRouter = require('./stock');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Inventory API is running' });
});

router.use('/categories', categoriesRouter);
router.use('/products', productsRouter);
router.use('/stock', stockRouter);

module.exports = router;
