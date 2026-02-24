const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true 
};

async function init() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server.');

    await connection.query(`CREATE DATABASE IF NOT EXISTS stocksmart`);
    console.log('Database "stocksmart" created or already exists.');

    await connection.changeUser({ database: 'stocksmart' });

    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL DEFAULT 'General',
        cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        sell_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        gst_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
        stock INT NOT NULL DEFAULT 0,
        warehouse VARCHAR(50) NOT NULL DEFAULT 'Main Store',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(36) PRIMARY KEY,
        invoice_number VARCHAR(50) NOT NULL UNIQUE,
        customer_name VARCHAR(100) NOT NULL DEFAULT 'Walk-in',
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_gst DECIMAL(10,2) NOT NULL DEFAULT 0,
        cgst DECIMAL(10,2) NOT NULL DEFAULT 0,
        sgst DECIMAL(10,2) NOT NULL DEFAULT 0,
        grand_total DECIMAL(10,2) NOT NULL DEFAULT 0,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
        amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
        balance DECIMAL(10,2) NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sale_items (
        id VARCHAR(36) PRIMARY KEY,
        sale_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36),
        product_name VARCHAR(255) NOT NULL,
        product_code VARCHAR(50) NOT NULL DEFAULT '',
        price DECIMAL(10,2) NOT NULL,
        qty INT NOT NULL DEFAULT 1,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0,
        gst_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
        line_total DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `;

    await connection.query(createTablesQuery);
    console.log('Tables created successfully.');

    // Seed Data Check
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      console.log('Seeding initial products...');
      const seedQuery = `
        INSERT INTO products (id, name, code, category, cost_price, sell_price, gst_rate, stock, warehouse) VALUES
        (UUID(), 'Tata Salt 1kg', 'TS001', 'Groceries', 15, 20, 5, 250, 'Main Store'),
        (UUID(), 'Amul Butter 500g', 'AB002', 'Dairy', 38, 50, 12, 85, 'Main Store'),
        (UUID(), 'Maggi Noodles Pack', 'MN003', 'Groceries', 8, 12, 18, 320, 'Warehouse B'),
        (UUID(), 'Surf Excel 1kg', 'SE004', 'Household', 50, 70, 28, 12, 'Main Store'),
        (UUID(), 'Red Label Tea 500g', 'RL005', 'Beverages', 110, 150, 5, 45, 'Main Store'),
        (UUID(), 'Notebook 200pg', 'NB006', 'Stationery', 28, 40, 12, 5, 'Warehouse B'),
        (UUID(), 'LED Bulb 12W', 'LB007', 'Electronics', 85, 120, 18, 60, 'Main Store'),
        (UUID(), 'USB Cable 1m', 'UC008', 'Electronics', 45, 80, 18, 8, 'Warehouse B');
      `;
      await connection.query(seedQuery);
      console.log('Seed data inserted.');
    } else {
      console.log('Products table already has data. Skipping seed.');
    }

  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    if (connection) await connection.end();
  }
}

init();
