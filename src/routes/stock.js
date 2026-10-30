const express = require('express');
const { body, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const controller = require('../controllers/stockController');

const router = express.Router();

router.get('/summary', controller.getInventorySummary);

router.get(
  '/movements',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('product_id').optional().isInt({ min: 1 }),
    query('type').optional().isIn(['in', 'out', 'adjustment']),
    validate,
  ],
  controller.listMovements
);

router.post(
  '/adjust',
  [
    body('product_id').isInt({ min: 1 }).withMessage('product_id is required'),
    body('movement_type')
      .isIn(['in', 'out', 'adjustment'])
      .withMessage('movement_type must be in, out, or adjustment'),
    body('quantity')
      .isInt({ min: 0 })
      .withMessage('quantity must be a non-negative integer'),
    body('reason').optional({ nullable: true }).isString().isLength({ max: 255 }),
    body('reference').optional({ nullable: true }).isString().isLength({ max: 100 }),
    validate,
  ],
  controller.adjustStock
);

module.exports = router;
