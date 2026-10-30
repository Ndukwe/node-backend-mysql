const { pool } = require('../config/db');

async function seed() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query('DELETE FROM stock_movements');
    await connection.query('DELETE FROM products');
    await connection.query('DELETE FROM categories');

    const [categoryResult] = await connection.query(
      `INSERT INTO categories (name, description) VALUES
        ('Electronics', 'Phones, laptops, and accessories'),
        ('Office Supplies', 'Stationery and desk items'),
        ('Furniture', 'Chairs, desks, and storage')`
    );

    const firstCategoryId = categoryResult.insertId;

    const [productResult] = await connection.query(
      `INSERT INTO products
        (sku, name, description, category_id, price, cost, quantity, reorder_level, unit)
       VALUES
        ('ELC-001', 'Wireless Mouse', 'Ergonomic USB wireless mouse', ?, 24.99, 12.50, 120, 20, 'pcs'),
        ('ELC-002', 'USB-C Hub', '7-in-1 multiport adapter', ?, 49.99, 28.00, 45, 15, 'pcs'),
        ('OFF-001', 'A4 Paper Ream', '500 sheets, 80gsm', ?, 6.50, 3.20, 8, 25, 'ream'),
        ('FUR-001', 'Office Chair', 'Adjustable mesh office chair', ?, 189.00, 110.00, 15, 5, 'pcs')`,
      [firstCategoryId, firstCategoryId, firstCategoryId + 1, firstCategoryId + 2]
    );

    const firstProductId = productResult.insertId;

    await connection.query(
      `INSERT INTO stock_movements
        (product_id, movement_type, quantity, previous_quantity, new_quantity, reason, reference)
       VALUES
        (?, 'in', 120, 0, 120, 'Initial stock', 'SEED-001'),
        (?, 'in', 45, 0, 45, 'Initial stock', 'SEED-002'),
        (?, 'in', 8, 0, 8, 'Initial stock', 'SEED-003'),
        (?, 'in', 15, 0, 15, 'Initial stock', 'SEED-004')`,
      [firstProductId, firstProductId + 1, firstProductId + 2, firstProductId + 3]
    );

    await connection.commit();
    console.log('Seed data inserted successfully.');
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Failed to seed database:', err.message);
  process.exit(1);
});
