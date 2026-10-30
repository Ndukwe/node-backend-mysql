const { query } = require('../config/db');

async function listCategories(req, res, next) {
  try {
    const categories = await query(
      `SELECT c.*,
              COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

async function getCategory(req, res, next) {
  try {
    const rows = await query(
      `SELECT c.*,
              COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       WHERE c.id = :id
       GROUP BY c.id`,
      { id: req.params.id }
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, description = null } = req.body;
    const result = await query(
      `INSERT INTO categories (name, description) VALUES (:name, :description)`,
      { name, description }
    );

    const rows = await query(`SELECT * FROM categories WHERE id = :id`, {
      id: result.insertId,
    });

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const existing = await query(`SELECT * FROM categories WHERE id = :id`, {
      id: req.params.id,
    });

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const current = existing[0];
    const { name, description } = req.body;

    await query(
      `UPDATE categories
       SET name = :name,
           description = :description
       WHERE id = :id`,
      {
        id: req.params.id,
        name: name ?? current.name,
        description: description === undefined ? current.description : description,
      }
    );

    const rows = await query(`SELECT * FROM categories WHERE id = :id`, {
      id: req.params.id,
    });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const existing = await query(`SELECT id FROM categories WHERE id = :id`, {
      id: req.params.id,
    });

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await query(`DELETE FROM categories WHERE id = :id`, { id: req.params.id });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
