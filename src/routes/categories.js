const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const controller = require('../controllers/categoriesController');

const router = express.Router();

router.get('/', controller.listCategories);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'), validate],
  controller.getCategory
);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 100 }),
    body('description').optional({ nullable: true }).isString().isLength({ max: 255 }),
    validate,
  ],
  controller.createCategory
);

router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
    body('name').optional().trim().notEmpty().isLength({ max: 100 }),
    body('description').optional({ nullable: true }).isString().isLength({ max: 255 }),
    validate,
  ],
  controller.updateCategory
);

router.delete(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'), validate],
  controller.deleteCategory
);

module.exports = router;
