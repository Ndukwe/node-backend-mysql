const { getConnection, query } = require('../config/db');

async function listMovements(req, res, next) {
  try {
    const { product_id, type, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
    const offset = (pageNum - 1) * pageSize;

    const where = [];
    const params = {};

    if (product_id) {
      where.push('sm.product_id = :product_id');
      params.product_id = product_id;
    }
    if (type) {
      where.push('sm.movement_type = :type');
      params.type = type;
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await query(
      `SELECT COUNT(*) AS total FROM stock_movements sm ${whereSql}`,
      params
    );

    const movements = await query(
      `SELECT sm.*, p.sku, p.name AS product_name
       FROM stock_movements sm
       JOIN products p ON p.id = sm.product_id
       ${whereSql}
       ORDER BY sm.created_at DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params
    );

    res.json({
      success: true,
      data: movements,
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

async function adjustStock(req, res, next) {
  const connection = await getConnection();

  try {
    const {
      product_id,
      movement_type,
      quantity,
      reason = null,
      reference = null,
    } = req.body;

    await connection.beginTransaction();

    const [products] = await connection.execute(
      `SELECT id, quantity FROM products WHERE id = ? FOR UPDATE`,
      [product_id]
    );

    if (!products.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previous = products[0].quantity;
    let nextQuantity;

    if (movement_type === 'in' || movement_type === 'out') {
      if (quantity < 1) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'quantity must be at least 1 for in/out movements',
        });
      }
    }

    if (movement_type === 'in') {
      nextQuantity = previous + quantity;
    } else if (movement_type === 'out') {
      if (quantity > previous) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${previous}`,
        });
      }
      nextQuantity = previous - quantity;
    } else if (movement_type === 'adjustment') {
      nextQuantity = quantity;
    } else {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'movement_type must be in, out, or adjustment',
      });
    }

    await connection.execute(
      `UPDATE products SET quantity = ? WHERE id = ?`,
      [nextQuantity, product_id]
    );

    const delta =
      movement_type === 'adjustment' ? nextQuantity - previous : quantity;

    const [movementResult] = await connection.execute(
      `INSERT INTO stock_movements
        (product_id, movement_type, quantity, previous_quantity, new_quantity, reason, reference)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product_id, movement_type, delta, previous, nextQuantity, reason, reference]
    );

    await connection.commit();

    const rows = await query(
      `SELECT sm.*, p.sku, p.name AS product_name
       FROM stock_movements sm
       JOIN products p ON p.id = sm.product_id
       WHERE sm.id = :id`,
      { id: movementResult.insertId }
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
}

async function getInventorySummary(req, res, next) {
  try {
    const [summary] = await query(
      `SELECT
         COUNT(*) AS total_products,
         SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_products,
         SUM(CASE WHEN is_active = 1 AND quantity <= reorder_level THEN 1 ELSE 0 END) AS low_stock_products,
         COALESCE(SUM(CASE WHEN is_active = 1 THEN quantity ELSE 0 END), 0) AS total_units,
         COALESCE(SUM(CASE WHEN is_active = 1 THEN quantity * cost ELSE 0 END), 0) AS inventory_cost_value,
         COALESCE(SUM(CASE WHEN is_active = 1 THEN quantity * price ELSE 0 END), 0) AS inventory_retail_value
       FROM products`
    );

    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMovements,
  adjustStock,
  getInventorySummary,
};
