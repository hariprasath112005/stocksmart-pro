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
      CREATE TABLE IF NOT EXISTS company_settings (
        id VARCHAR(36) PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        unit_name VARCHAR(255),
        address TEXT,
        gstin VARCHAR(15),
        state VARCHAR(50),
        state_code VARCHAR(2),
        phone VARCHAR(20),
        email VARCHAR(100),
        bank_name VARCHAR(100),
        account_no VARCHAR(50),
        ifsc_code VARCHAR(20),
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        billing_address TEXT,
        shipping_address TEXT,
        gstin VARCHAR(15),
        state VARCHAR(50),
        state_code VARCHAR(2),
        phone VARCHAR(20),
        email VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL DEFAULT 'General',
        hsn_code VARCHAR(20),
        gst_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
        stock INT NOT NULL DEFAULT 0,
        warehouse VARCHAR(50) NOT NULL DEFAULT 'Main Store',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(36) PRIMARY KEY,
        invoice_number VARCHAR(50) NOT NULL UNIQUE,
        invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        due_date DATETIME,
        financial_year VARCHAR(10),
        payment_mode VARCHAR(50) NOT NULL DEFAULT 'cash',
        place_of_supply VARCHAR(50),
        reverse_charge BOOLEAN DEFAULT FALSE,
        reference_number VARCHAR(50),
        delivery_note_number VARCHAR(50),
        transport_name VARCHAR(100),
        vehicle_number VARCHAR(50),
        lr_number VARCHAR(50),
        eway_bill_number VARCHAR(50),
        customer_id VARCHAR(36),
        customer_name VARCHAR(100) NOT NULL DEFAULT 'Walk-in',
        billing_address TEXT,
        shipping_address TEXT,
        customer_gstin VARCHAR(15),
        customer_state VARCHAR(50),
        customer_state_code VARCHAR(2),
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_gst DECIMAL(10,2) NOT NULL DEFAULT 0,
        cgst DECIMAL(10,2) NOT NULL DEFAULT 0,
        sgst DECIMAL(10,2) NOT NULL DEFAULT 0,
        igst DECIMAL(10,2) NOT NULL DEFAULT 0,
        round_off DECIMAL(10,2) NOT NULL DEFAULT 0,
        grand_total DECIMAL(10,2) NOT NULL DEFAULT 0,
        grand_total_words TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );

      CREATE TABLE IF NOT EXISTS sale_items (
        id VARCHAR(36) PRIMARY KEY,
        sale_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36),
        product_name VARCHAR(255) NOT NULL,
        product_code VARCHAR(50) NOT NULL DEFAULT '',
        hsn_code VARCHAR(20),
        qty INT NOT NULL DEFAULT 1,
        unit VARCHAR(20) DEFAULT 'PCS',
        price DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0,
        taxable_value DECIMAL(10,2) NOT NULL DEFAULT 0,
        gst_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
        cgst DECIMAL(10,2) NOT NULL DEFAULT 0,
        sgst DECIMAL(10,2) NOT NULL DEFAULT 0,
        igst DECIMAL(10,2) NOT NULL DEFAULT 0,
        line_total DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `;

    await connection.query(createTablesQuery);

    // Migration/Updates: Add columns to existing tables if they don't exist
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    const ensureColumn = async (tableName, columnName, definition) => {
        const [columns] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
        const columnNames = columns.map(c => c.Field);
        if (!columnNames.includes(columnName)) {
            await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
            console.log(`Added column ${columnName} to ${tableName}`);
        }
    };

    if (tableNames.includes('products')) {
        await ensureColumn('products', 'hsn_code', 'VARCHAR(20)');
    }
    if (tableNames.includes('sales')) {
        await ensureColumn('sales', 'invoice_date', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
        await ensureColumn('sales', 'due_date', 'DATETIME');
        await ensureColumn('sales', 'financial_year', 'VARCHAR(10)');
        await ensureColumn('sales', 'payment_mode', "VARCHAR(50) NOT NULL DEFAULT 'cash'");
        await ensureColumn('sales', 'place_of_supply', 'VARCHAR(50)');
        await ensureColumn('sales', 'reverse_charge', 'BOOLEAN DEFAULT FALSE');
        await ensureColumn('sales', 'reference_number', 'VARCHAR(50)');
        await ensureColumn('sales', 'delivery_note_number', 'VARCHAR(50)');
        await ensureColumn('sales', 'transport_name', 'VARCHAR(100)');
        await ensureColumn('sales', 'vehicle_number', 'VARCHAR(50)');
        await ensureColumn('sales', 'lr_number', 'VARCHAR(50)');
        await ensureColumn('sales', 'eway_bill_number', 'VARCHAR(50)');
        await ensureColumn('sales', 'customer_id', 'VARCHAR(36)');
        await ensureColumn('sales', 'billing_address', 'TEXT');
        await ensureColumn('sales', 'shipping_address', 'TEXT');
        await ensureColumn('sales', 'customer_gstin', 'VARCHAR(15)');
        await ensureColumn('sales', 'customer_state', 'VARCHAR(50)');
        await ensureColumn('sales', 'customer_state_code', 'VARCHAR(2)');
        await ensureColumn('sales', 'igst', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
        await ensureColumn('sales', 'round_off', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
        await ensureColumn('sales', 'grand_total_words', 'TEXT');
    }
    if (tableNames.includes('sale_items')) {
        await ensureColumn('sale_items', 'hsn_code', 'VARCHAR(20)');
        await ensureColumn('sale_items', 'unit', "VARCHAR(20) DEFAULT 'PCS'");
        await ensureColumn('sale_items', 'taxable_value', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
        await ensureColumn('sale_items', 'cgst', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
        await ensureColumn('sale_items', 'sgst', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
        await ensureColumn('sale_items', 'igst', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
    }

    // Seed default company settings if empty
    const [settings] = await connection.query('SELECT COUNT(*) as count FROM company_settings');
    if (settings[0].count === 0) {
        const id = uuidv4();
        await connection.query(`
            INSERT INTO company_settings (id, company_name, address, gstin, state, state_code, phone, email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, 'Theecal Powersystems', '123 Solar Way, Chennai', '33AAAAA0000A1Z5', 'Tamil Nadu', '33', '9876543210', 'info@theecal.in']);
        console.log('Seeded default company settings');
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
    const { name, code, category, gst_rate, stock, warehouse, hsn_code } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and Code are required.' });
    }

    const id = uuidv4();
    const sql = `INSERT INTO products (id, name, code, category, gst_rate, stock, warehouse, hsn_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await query(sql, [id, name, code, category, gst_rate, stock, warehouse, hsn_code]);
    
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

// --- CUSTOMERS API ---

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await query('SELECT * FROM customers ORDER BY name ASC');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, billing_address, shipping_address, gstin, state, state_code, phone, email } = req.body;
    const id = uuidv4();
    const sql = `INSERT INTO customers (id, name, billing_address, shipping_address, gstin, state, state_code, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await query(sql, [id, name, billing_address, shipping_address, gstin, state, state_code, phone, email]);
    const [newCustomer] = await query('SELECT * FROM customers WHERE id = ?', [id]);
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SETTINGS API ---

app.get('/api/settings', async (req, res) => {
  try {
    const [settings] = await query('SELECT * FROM company_settings LIMIT 1');
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { id, company_name, unit_name, address, gstin, state, state_code, phone, email, bank_name, account_no, ifsc_code } = req.body;
    const sql = `
      UPDATE company_settings 
      SET company_name = ?, unit_name = ?, address = ?, gstin = ?, state = ?, state_code = ?, phone = ?, email = ?, bank_name = ?, account_no = ?, ifsc_code = ?
      WHERE id = ?
    `;
    await query(sql, [company_name, unit_name, address, gstin, state, state_code, phone, email, bank_name, account_no, ifsc_code, id]);
    const [updated] = await query('SELECT * FROM company_settings WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// Create a new sale (GST Invoice)
app.post('/api/sales', async (req, res) => {
  if (!pool) pool = mysql.createPool(dbConfig);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      invoiceDate, dueDate, financialYear, paymentMode, placeOfSupply,
      reverseCharge, referenceNumber, deliveryNoteNumber, transportName,
      vehicleNumber, lrNumber, ewayBillNumber,
      customerId, customerName, billingAddress, shippingAddress,
      customerGstin, customerState, customerStateCode,
      subtotal, taxableTotal, totalGst, cgst, sgst, igst, roundOff,
      grandTotal, grandTotalWords, cart
    } = req.body;

    // Generate Invoice Number (if not provided)
    let invoiceNumber = req.body.invoiceNumber;
    if (!invoiceNumber) {
        const now = new Date();
        const y = now.getFullYear().toString().slice(-2);
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        const rand = Math.floor(Math.random() * 9000 + 1000);
        invoiceNumber = `INV-${y}${m}${d}-${rand}`;
    }

    const saleId = uuidv4();
    
    // Insert Sale
    const saleSql = `
      INSERT INTO sales (
        id, invoice_number, invoice_date, due_date, financial_year, payment_mode,
        place_of_supply, reverse_charge, reference_number, delivery_note_number,
        transport_name, vehicle_number, lr_number, eway_bill_number,
        customer_id, customer_name, billing_address, shipping_address,
        customer_gstin, customer_state, customer_state_code,
        subtotal, total_gst, cgst, sgst, igst, round_off,
        grand_total, grand_total_words, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
    `;
    
    await connection.execute(saleSql, [
      saleId, 
      invoiceNumber, 
      invoiceDate || new Date(), 
      dueDate || null, 
      financialYear || null, 
      paymentMode || 'cash',
      placeOfSupply || null, 
      reverseCharge || false, 
      referenceNumber || null, 
      deliveryNoteNumber || null,
      transportName || null, 
      vehicleNumber || null, 
      lrNumber || null, 
      ewayBillNumber || null,
      customerId || null, 
      customerName || 'Walk-in', 
      billingAddress || null, 
      shippingAddress || null,
      customerGstin || null, 
      customerState || null, 
      customerStateCode || null,
      taxableTotal || subtotal, 
      totalGst || 0, 
      cgst || 0, 
      sgst || 0, 
      igst || 0, 
      roundOff || 0,
      grandTotal || 0, 
      grandTotalWords || null
    ]);

    // Insert Sale Items
    const itemSql = `
      INSERT INTO sale_items (
        id, sale_id, product_id, product_name, product_code, hsn_code,
        qty, unit, price, discount, taxable_value, gst_rate,
        cgst, sgst, igst, line_total
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertedItems = [];

    for (const item of cart) {
      const itemId = uuidv4();
      
      await connection.execute(itemSql, [
        itemId, 
        saleId, 
        item.productId || null, 
        item.name, 
        item.code || '', 
        item.hsnCode || null,
        item.qty || 1, 
        item.unit || 'PCS', 
        item.price || 0, 
        item.discount || 0,
        item.taxableValue || 0, 
        item.gstRate || 0,
        item.cgst || 0, 
        item.sgst || 0, 
        item.igst || 0,
        item.lineTotal || (item.taxableValue + (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0))
      ]);
      
      insertedItems.push({ id: itemId, ...item });

      // Update Stock
      if (item.productId) {
         await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.productId]);
      }
    }

    await connection.commit();
    
    const [saleRows] = await connection.execute('SELECT * FROM sales WHERE id = ?', [saleId]);
    
    res.status(201).json({ sale: saleRows[0], items: insertedItems });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
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
