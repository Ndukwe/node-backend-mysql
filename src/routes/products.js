const express = require('express');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const controller = require('../controllers/productsController');

const router = express.Router();

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category_id').optional().isInt({ min: 1 }),
    query('low_stock').optional().isIn(['true', 'false', '0', '1']),
    query('is_active').optional().isIn(['true', 'false', '0', '1']),
    validate,
  ],
  controller.listProducts
);

router.get('/low-stock', controller.getLowStock);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'), validate],
  controller.getProduct
);

router.post(
  '/',
  [
    body('sku').trim().notEmpty().withMessage('sku is required').isLength({ max: 64 }),
    body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 150 }),
    body('description').optional({ nullable: true }).isString(),
    body('category_id').optional({ nullable: true }).isInt({ min: 1 }),
    body('price').optional().isFloat({ min: 0 }),
    body('cost').optional().isFloat({ min: 0 }),
    body('quantity').optional().isInt({ min: 0 }),
    body('reorder_level').optional().isInt({ min: 0 }),
    body('unit').optional().trim().isLength({ max: 30 }),
    body('is_active').optional().isBoolean(),
    validate,
  ],
  controller.createProduct
);

router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
    body('sku').optional().trim().notEmpty().isLength({ max: 64 }),
    body('name').optional().trim().notEmpty().isLength({ max: 150 }),
    body('description').optional({ nullable: true }).isString(),
    body('category_id').optional({ nullable: true }).isInt({ min: 1 }),
    body('price').optional().isFloat({ min: 0 }),
    body('cost').optional().isFloat({ min: 0 }),
    body('reorder_level').optional().isInt({ min: 0 }),
    body('unit').optional().trim().isLength({ max: 30 }),
    body('is_active').optional().isBoolean(),
    validate,
  ],
  controller.updateProduct
);

router.delete(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'), validate],
  controller.deleteProduct
);

module.exports = router;
