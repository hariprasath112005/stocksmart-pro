const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'theecal_db',
};

const products = [
  // 🔹 MOTORS / PUMPS
  { name: "Sharp Crystal 0.5 HP Water Pump Motor", category: "MOTORS / PUMPS", code: "MP-SC-05" },
  { name: "Sharp Crystal 1 HP Water Pump Motor", category: "MOTORS / PUMPS", code: "MP-SC-10" },
  { name: "Sharp Crystal 1 HP Special Water Pump Motor", category: "MOTORS / PUMPS", code: "MP-SC-10S" },
  { name: "C.R.I 0.5 HP Water Pump Motor", category: "MOTORS / PUMPS", code: "MP-CRI-05" },
  { name: "C.R.I 1 HP Water Pump Motor", category: "MOTORS / PUMPS", code: "MP-CRI-10" },
  { name: "1 HP Openwell Submersible Pump", category: "MOTORS / PUMPS", code: "MP-OW-10" },
  { name: "0.5 HP Booster Water Pump", category: "MOTORS / PUMPS", code: "MP-BST-05" },
  { name: "1 HP Booster Water Pump", category: "MOTORS / PUMPS", code: "MP-BST-10" },
  { name: "1 HP Submersible Pump Motor", category: "MOTORS / PUMPS", code: "MP-SUB-10" },
  { name: "1.5 HP Submersible Pump Motor", category: "MOTORS / PUMPS", code: "MP-SUB-15" },

  // 🔹 CAPACITOR BOXES
  { name: "Capacitor Starter Box for 1 HP Motor", category: "CAPACITOR BOXES", code: "CB-10" },
  { name: "Capacitor Starter Box for 1.5 HP Motor", category: "CAPACITOR BOXES", code: "CB-15" },

  // 🔹 CABLES
  { name: "3 Core Flat Cable – 1.5 Sq.mm (Per Meter)", category: "CABLES", code: "CBL-15" },
  { name: "3 Core Flat Cable – 2.5 Sq.mm (Per Meter)", category: "CABLES", code: "CBL-25" },

  // 🔹 SINICON CONTROLLERS
  { name: "Sinicon Automatic Water Level & Pump Controller (Autofill Sensor Type)", category: "SINICON CONTROLLERS", code: "SC-AF-SN" },
  { name: "Sinicon Fluid Level Controller (Autofill Float Type)", category: "SINICON CONTROLLERS", code: "SC-AF-FL" },

  // 🔹 BATTERIES - Powerzone
  { name: "Powerzone 2.5 Ah Battery", category: "BATTERIES", code: "BT-PZ-25" },
  { name: "Powerzone Z4L Battery", category: "BATTERIES", code: "BT-PZ-Z4L" },
  { name: "Powerzone Z5L Battery", category: "BATTERIES", code: "BT-PZ-Z5L" },
  { name: "Powerzone 5L-B Battery", category: "BATTERIES", code: "BT-PZ-5LB" },
  { name: "Powerzone Z9R Battery", category: "BATTERIES", code: "BT-PZ-Z9R" },
  { name: "Powerzone 9-B Battery", category: "BATTERIES", code: "BT-PZ-9B" },

  // 🔹 BATTERIES - Exide
  { name: "Exide 2.5L-C Battery", category: "BATTERIES", code: "BT-EX-25LC" },
  { name: "Exide Z4A Battery", category: "BATTERIES", code: "BT-EX-Z4A" },
  { name: "Exide Z5A Battery", category: "BATTERIES", code: "BT-EX-Z5A" },
  { name: "Exide 5L-B Battery", category: "BATTERIES", code: "BT-EX-5LB" },
  { name: "Exide Z7 Battery", category: "BATTERIES", code: "BT-EX-Z7" },
  { name: "Exide 7B-B Battery", category: "BATTERIES", code: "BT-EX-7BB" },
  { name: "Exide Z9 Battery", category: "BATTERIES", code: "BT-EX-Z9" },
  { name: "Exide 9-B Battery", category: "BATTERIES", code: "BT-EX-9B" },
  { name: "Exide X14 Battery", category: "BATTERIES", code: "BT-EX-X14" },
  { name: "Exide 14L-A2 Battery", category: "BATTERIES", code: "BT-EX-14LA2" },
  { name: "Exide 38B20L Car Battery", category: "BATTERIES", code: "BT-EX-38B20L" },
  { name: "Exide 38B20R Car Battery", category: "BATTERIES", code: "BT-EX-38B20R" },
  { name: "Exide DIN44LH Battery", category: "BATTERIES", code: "BT-EX-DIN44" },
  { name: "Exide DIN50 Battery", category: "BATTERIES", code: "BT-EX-DIN50" },
  { name: "Exide DIN55R Battery", category: "BATTERIES", code: "BT-EX-DIN55R" },
  { name: "Exide 55D23L Battery", category: "BATTERIES", code: "BT-EX-55D23L" },
  { name: "Exide DIN60 Battery", category: "BATTERIES", code: "BT-EX-DIN60" },
  { name: "Exide DIN66 Battery", category: "BATTERIES", code: "BT-EX-DIN66" },
  { name: "Exide EY70F Battery", category: "BATTERIES", code: "BT-EX-EY70F" },
  { name: "Exide EY70L Battery", category: "BATTERIES", code: "BT-EX-EY70L" },
  { name: "Exide 75D23L Battery", category: "BATTERIES", code: "BT-EX-75D23L" },
  { name: "Exide Drive 80L Battery", category: "BATTERIES", code: "BT-EX-DR80L" },
  { name: "Exide Drive 88L Battery", category: "BATTERIES", code: "BT-EX-DR88L" },
  { name: "Exide Drive 100L Battery", category: "BATTERIES", code: "BT-EX-DR100L" },
  { name: "Exide InvaMaster 150 Inverter Battery", category: "BATTERIES", code: "BT-EX-IM150" },
  { name: "Exide InvaMaster 200 Inverter Battery", category: "BATTERIES", code: "BT-EX-IM200" },
  { name: "Exide Solar Tubular 150 Battery", category: "BATTERIES", code: "BT-EX-ST150" },
  { name: "Exide Solar Tubular 200 Battery", category: "BATTERIES", code: "BT-EX-ST200" },

  // 🔹 WATER PURIFIER SPARES
  { name: "Water Purifier Spun Filter", category: "WATER PURIFIER SPARES", code: "WP-SF" },
  { name: "Water Purifier Spun Filter Housing", category: "WATER PURIFIER SPARES", code: "WP-SFH" },
  { name: "Water Purifier Inline Filter", category: "WATER PURIFIER SPARES", code: "WP-ILF" },
  { name: "RO Membrane", category: "WATER PURIFIER SPARES", code: "WP-ROM" },
  { name: "RO Membrane Housing", category: "WATER PURIFIER SPARES", code: "WP-ROMH" },
  { name: "Solenoid Valve (SV Valve) for Purifier", category: "WATER PURIFIER SPARES", code: "WP-SV" },
  { name: "SMPS Adapter for Water Purifier", category: "WATER PURIFIER SPARES", code: "WP-SMPS" },
  { name: "Water Purifier Tap/Faucet", category: "WATER PURIFIER SPARES", code: "WP-TP" },
  { name: "Water Purifier Inlet Valve Set", category: "WATER PURIFIER SPARES", code: "WP-IVS" },
  { name: "Water Purifier Float Switch", category: "WATER PURIFIER SPARES", code: "WP-FS" },
  { name: "Water Purifier Cartridge Filter", category: "WATER PURIFIER SPARES", code: "WP-CF" },

  // 🔹 STABILIZERS (MICROTEK)
  { name: "Microtek Pearl 4090 Voltage Stabilizer", category: "STABILIZERS (MICROTEK)", code: "ST-MT-4090" },
  { name: "Microtek Pearl 4150 Voltage Stabilizer", category: "STABILIZERS (MICROTEK)", code: "ST-MT-4150" },
  { name: "Microtek Pearl 4130 Voltage Stabilizer", category: "STABILIZERS (MICROTEK)", code: "ST-MT-4130" },

  // 🔹 WATER HEATERS / GEYSERS
  { name: "Media 5.5 Litre Water Heater", category: "WATER HEATERS / GEYSERS", code: "WH-MD-55" },
  { name: "Media 10 Litre Water Heater", category: "WATER HEATERS / GEYSERS", code: "WH-MD-10" },
  { name: "Media 15 Litre Water Heater", category: "WATER HEATERS / GEYSERS", code: "WH-MD-15" },
  { name: "Havells 10 Litre Water Heater", category: "WATER HEATERS / GEYSERS", code: "WH-HV-10" },
  { name: "Havells 15 Litre Water Heater", category: "WATER HEATERS / GEYSERS", code: "WH-HV-15" },
  { name: "Havells 25 Litre Water Heater", category: "WATER HEATERS / GEYSERS", code: "WH-HV-25" },

  // 🔹 INVERTERS
  { name: "Exide 925 VA / 12V Inverter", category: "INVERTERS", code: "INV-EX-925" },
  { name: "Exide 1125 VA / 12V Inverter", category: "INVERTERS", code: "INV-EX-1125" },
  { name: "Microtek 825 VA / 12V Inverter", category: "INVERTERS", code: "INV-MT-825" },
  { name: "Microtek 1025 VA / 12V Inverter", category: "INVERTERS", code: "INV-MT-1025" },
  { name: "Microtek 1100 VA / 12V Inverter", category: "INVERTERS", code: "INV-MT-1100" },
  { name: "Microtek 1225 VA / 12V Inverter", category: "INVERTERS", code: "INV-MT-1225" },
  { name: "Microtek 1550 VA / 12V Inverter", category: "INVERTERS", code: "INV-MT-1550" },
  { name: "Microtek 1825 VA / 12V Inverter", category: "INVERTERS", code: "INV-MT-1825" },
  { name: "Microtek 2000 VA / 24V Inverter", category: "INVERTERS", code: "INV-MT-2000" },
  { name: "Microtek 2350 VA / 24V Inverter", category: "INVERTERS", code: "INV-MT-2350" },
];

async function seed() {
  let connection;
  try {
    const initConfig = { ...dbConfig, database: undefined };
    connection = await mysql.createConnection(initConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS theecal_db`);
    await connection.changeUser({ database: 'theecal_db' });
    console.log('Connected to database.');

    // Clear existing products safely
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    try { await connection.query('DELETE FROM sale_items'); } catch(e) {}
    try { await connection.query('DELETE FROM sales'); } catch(e) {}
    try { await connection.query('DELETE FROM products'); } catch(e) {}
    
    // Ensure table exists (minimal schema for seeding)
    await connection.query(`
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
      )
    `);

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Cleared existing data and ensured table exists.');

    const sql = `INSERT INTO products (id, name, code, category, gst_rate, stock, warehouse) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    for (const p of products) {
      await connection.execute(sql, [
        uuidv4(),
        p.name,
        p.code,
        p.category,
        18, // Default 18% GST
        0,  // Initial stock 0
        'Main Store'
      ]);
    }

    console.log(`Successfully seeded ${products.length} products.`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    if (connection) await connection.end();
    process.exit();
  }
}

seed();