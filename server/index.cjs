const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // We'll need uuid since we aren't using Supabase gen_random_uuid()
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'theecal_db',
  decimalNumbers: true
};

// Create a pool instead of a single connection for better concurrency
let pool;

async function initializeDatabase() {
  const initConfig = { ...dbConfig, database: undefined, multipleStatements: true };
  let connection;
  try {
    connection = await mysql.createConnection(initConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS theecal_db`);
    await connection.changeUser({ database: 'theecal_db' });

    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL DEFAULT 'General',
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

    // Migration: Remove cost_price and sell_price if they exist
    try {
      const [columns] = await connection.query('SHOW COLUMNS FROM products');
      const columnNames = columns.map(c => c.Field);
      
      if (columnNames.includes('cost_price')) {
        await connection.query('ALTER TABLE products DROP COLUMN cost_price');
        console.log('Dropped cost_price from products');
      }
      if (columnNames.includes('sell_price')) {
        await connection.query('ALTER TABLE products DROP COLUMN sell_price');
        console.log('Dropped sell_price from products');
      }
    } catch (migErr) {
      console.error('Migration error (ignoring):', migErr);
    }

    console.log('Database and tables initialized.');
  } catch (err) {
    console.error('Error during database initialization:', err);
    throw err;
  } finally {
    if (connection) await connection.end();
  }
}

// Helper function to execute queries
async function query(sql, params) {
  if (!pool) pool = mysql.createPool(dbConfig);
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// --- PRODUCTS API ---

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await query('SELECT * FROM products ORDER BY name ASC');
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// Add a product
app.post('/api/products', async (req, res) => {
  try {
    const { name, code, category, gst_rate, stock, warehouse } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and Code are required.' });
    }

    const id = uuidv4();
    const sql = `INSERT INTO products (id, name, code, category, gst_rate, stock, warehouse) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await query(sql, [id, name, code, category, gst_rate, stock, warehouse]);
    
    const [newProduct] = await query('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: `Product code "${req.body.code}" already exists.` });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Update product stock
app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body; // New absolute stock value
    
    // In our React hook, we calculate newStock = current + change.
    // So here we just update to the provided value.
    await query('UPDATE products SET stock = ? WHERE id = ?', [stock, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// --- SALES API ---

// Create a new sale
app.post('/api/sales', async (req, res) => {
  if (!pool) pool = mysql.createPool(dbConfig);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customerName, subtotal, totalGST, cgst, sgst, grandTotal,
      paymentMethod, amountPaid, balance, cart
    } = req.body;

    // Generate Invoice Number
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(Math.random() * 9000 + 1000);
    const invoiceNumber = `INV-${y}${m}${d}-${rand}`;

    const saleId = uuidv4();
    
    // Insert Sale
    const saleSql = `
      INSERT INTO sales (id, invoice_number, customer_name, subtotal, total_gst, cgst, sgst, grand_total, payment_method, amount_paid, balance, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
    `;
    
    await connection.execute(saleSql, [
      saleId, invoiceNumber, customerName, subtotal, totalGST, cgst, sgst, grandTotal, paymentMethod, amountPaid, balance
    ]);

    // Insert Sale Items
    const itemSql = `
      INSERT INTO sale_items (id, sale_id, product_id, product_name, product_code, price, qty, discount, gst_rate, line_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertedItems = [];

    for (const item of cart) {
      const itemId = uuidv4();
      const lineTotal = (item.price * item.qty) - item.discount;
      
      await connection.execute(itemSql, [
        itemId, saleId, item.productId, item.name, item.code, item.price, item.qty, item.discount, item.gstRate, lineTotal
      ]);
      
      insertedItems.push({ id: itemId, ...item });

      // Update Stock
      if (item.productId) {
         // This is a simplified "update stock" logic.
         // In a real app, you might want to read the current stock inside the transaction to prevent race conditions.
         // For now, simple update is fine.
         await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.productId]);
      }
    }

    await connection.commit();
    
    // Return the created sale object structure expected by the frontend
    const [saleRows] = await connection.execute('SELECT * FROM sales WHERE id = ?', [saleId]);
    
    res.status(201).json({ sale: saleRows[0], items: insertedItems });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// Get all sales
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await query('SELECT * FROM sales ORDER BY created_at DESC LIMIT 50');
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Dashboard Data
app.get('/api/dashboard', async (req, res) => {
  try {
    // 1. Total Sales Today
    const todaySales = await query(`
      SELECT SUM(grand_total) as total 
      FROM sales 
      WHERE DATE(created_at) = CURDATE()
    `);

    // 2. Monthly Sales
    const monthlySales = await query(`
      SELECT SUM(grand_total) as total 
      FROM sales 
      WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
    `);

    // 3. Inventory Stock
    const inventoryStock = await query(`
      SELECT SUM(stock) as totalStock
      FROM products
    `);

    // 3.1 Total Sales Count
    const salesCount = await query(`
      SELECT COUNT(*) as total 
      FROM sales
    `);

    // 4. Daily Sales Chart (Last 7 Days)
    const dailySales = await query(`
      SELECT DATE_FORMAT(created_at, '%a') as day, SUM(grand_total) as amount
      FROM sales
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at), day
      ORDER BY DATE(created_at)
    `);

    // 5. Top Selling Items
    const topSelling = await query(`
      SELECT 
        si.product_name as name, 
        SUM(si.qty) as qty, 
        SUM(si.line_total) as revenue
      FROM sale_items si
      GROUP BY si.product_id, si.product_name
      ORDER BY qty DESC
      LIMIT 5
    `);

    // 6. Stock Pie Chart
    const stockPie = await query(`
      SELECT category as name, SUM(stock) as value
      FROM products
      GROUP BY category
    `);

    res.json({
      stats: {
        today: todaySales[0]?.total || 0,
        month: monthlySales[0]?.total || 0,
        totalStock: inventoryStock[0]?.totalStock || 0,
        totalSalesCount: salesCount[0]?.total || 0
      },
      dailySales,
      topSelling,
      stockPie
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Reports Data
app.get('/api/reports', async (req, res) => {
  try {
    // Monthly Sales Trend (Last 6 months)
    const monthlySales = await query(`
      SELECT DATE_FORMAT(created_at, '%b') as month, SUM(grand_total) as amount
      FROM sales
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at), month
      ORDER BY YEAR(created_at), MONTH(created_at)
    `);

    // Tax Breakdown
    const taxBreakdown = await query(`
      SELECT 
        CONCAT(gst_rate, '% GST Items') as category,
        SUM(price * qty - discount) as taxable,
        SUM((price * qty - discount) * gst_rate / 100 / 2) as cgst,
        SUM((price * qty - discount) * gst_rate / 100 / 2) as sgst,
        0 as igst,
        SUM((price * qty - discount) * gst_rate / 100) as total
      FROM sale_items
      GROUP BY gst_rate
    `);

    // Item Wise Sales
    const itemWise = await query(`
      SELECT 
        si.product_name as name, 
        SUM(si.qty) as sold, 
        SUM(si.line_total) as revenue
      FROM sale_items si
      GROUP BY si.product_id, si.product_name
      ORDER BY revenue DESC
    `);
    
    // Note: The profit calculation above is approximate and assumes product cost hasn't changed.
    // A better way is to store cost_price in sale_items table at time of sale.

    res.json({
      monthlySales,
      taxBreakdown,
      itemWise
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  try {
    await initializeDatabase();
    pool = mysql.createPool(dbConfig);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
