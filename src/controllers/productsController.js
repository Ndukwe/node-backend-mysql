const { query } = require('../config/db');

const productSelect = `
  SELECT
    p.*,
    c.name AS category_name,
    CASE WHEN p.quantity <= p.reorder_level THEN 1 ELSE 0 END AS is_low_stock
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

async function listProducts(req, res, next) {
  try {
    const {
      search,
      category_id,
      low_stock,
      is_active,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
    const offset = (pageNum - 1) * pageSize;

    const where = [];
    const params = {};

    if (search) {
      where.push('(p.name LIKE :search OR p.sku LIKE :search OR p.description LIKE :search)');
      params.search = `%${search}%`;
    }
    if (category_id) {
      where.push('p.category_id = :category_id');
      params.category_id = category_id;
    }
    if (low_stock === 'true' || low_stock === '1') {
      where.push('p.quantity <= p.reorder_level');
    }
    if (is_active === 'true' || is_active === '1') {
      where.push('p.is_active = 1');
    } else if (is_active === 'false' || is_active === '0') {
      where.push('p.is_active = 0');
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await query(
      `SELECT COUNT(*) AS total FROM products p ${whereSql}`,
      params
    );

    const products = await query(
      `${productSelect}
       ${whereSql}
       ORDER BY p.updated_at DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params
    );

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / pageSize) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const rows = await query(`${productSelect} WHERE p.id = :id`, {
      id: req.params.id,
    });

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const {
      sku,
      name,
      description = null,
      category_id = null,
      price = 0,
      cost = 0,
      quantity = 0,
      reorder_level = 10,
      unit = 'pcs',
      is_active = true,
    } = req.body;

    if (category_id) {
      const categories = await query(`SELECT id FROM categories WHERE id = :id`, {
        id: category_id,
      });
      if (!categories.length) {
        return res.status(400).json({ success: false, message: 'Category not found' });
      }
    }

    const result = await query(
      `INSERT INTO products
        (sku, name, description, category_id, price, cost, quantity, reorder_level, unit, is_active)
       VALUES
        (:sku, :name, :description, :category_id, :price, :cost, :quantity, :reorder_level, :unit, :is_active)`,
      {
        sku,
        name,
        description,
        category_id,
        price,
        cost,
        quantity,
        reorder_level,
        unit,
        is_active: is_active ? 1 : 0,
      }
    );

    if (quantity > 0) {
      await query(
        `INSERT INTO stock_movements
          (product_id, movement_type, quantity, previous_quantity, new_quantity, reason, reference)
         VALUES
          (:product_id, 'in', :quantity, 0, :quantity, 'Initial stock on create', :reference)`,
        {
          product_id: result.insertId,
          quantity,
          reference: `CREATE-${result.insertId}`,
        }
      );
    }

    const rows = await query(`${productSelect} WHERE p.id = :id`, {
      id: result.insertId,
    });

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const existing = await query(`SELECT * FROM products WHERE id = :id`, {
      id: req.params.id,
    });

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      sku,
      name,
      description,
      category_id,
      price,
      cost,
      reorder_level,
      unit,
      is_active,
    } = req.body;

    if (category_id !== undefined && category_id !== null) {
      const categories = await query(`SELECT id FROM categories WHERE id = :id`, {
        id: category_id,
      });
      if (!categories.length) {
        return res.status(400).json({ success: false, message: 'Category not found' });
      }
    }

    const current = existing[0];

    await query(
      `UPDATE products SET
        sku = :sku,
        name = :name,
        description = :description,
        category_id = :category_id,
        price = :price,
        cost = :cost,
        reorder_level = :reorder_level,
        unit = :unit,
        is_active = :is_active
       WHERE id = :id`,
      {
        id: req.params.id,
        sku: sku ?? current.sku,
        name: name ?? current.name,
        description: description === undefined ? current.description : description,
        category_id: category_id === undefined ? current.category_id : category_id,
        price: price ?? current.price,
        cost: cost ?? current.cost,
        reorder_level: reorder_level ?? current.reorder_level,
        unit: unit ?? current.unit,
        is_active:
          is_active === undefined ? current.is_active : is_active ? 1 : 0,
      }
    );

    const rows = await query(`${productSelect} WHERE p.id = :id`, {
      id: req.params.id,
    });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const existing = await query(`SELECT id FROM products WHERE id = :id`, {
      id: req.params.id,
    });

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await query(`DELETE FROM products WHERE id = :id`, { id: req.params.id });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}

async function getLowStock(req, res, next) {
  try {
    const products = await query(
      `${productSelect}
       WHERE p.is_active = 1 AND p.quantity <= p.reorder_level
       ORDER BY p.quantity ASC`
    );
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStock,
};
