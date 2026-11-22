const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config();

let mysql = null;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  console.warn('[Database] mysql2 not available, will use sqlite fallback');
}

// -------------------------------------------------------------
// SQLite Fallback Setup
// -------------------------------------------------------------
const { DatabaseSync } = require('node:sqlite');
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const sqlitePath = path.join(dbDir, 'hytech.db');
let sqliteDb = null;

function getSqliteDb() {
  if (!sqliteDb) {
    sqliteDb = new DatabaseSync(sqlitePath);
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
  }
  return sqliteDb;
}

// -------------------------------------------------------------
// Database Config
// -------------------------------------------------------------
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hytech_hotel'
};

let activeDriver = 'sqlite'; // 'mysql' | 'sqlite'
let mysqlPool = null;

// Initial seed data
const defaultRooms = [
  ['economy-fan', 'Economy Fan Room', 'Standard', 800, 2, 3, '1 Double Bed', 'A budget-friendly room with electric fan, private bathroom, and free Wi-Fi. Simple, clean, and good for a short overnight stay.', 'Electric Fan, Private Bathroom, Free Wi-Fi, Fresh Linens, Work Desk', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
  ['solo-room', 'Solo Room', 'Solo', 1000, 1, 4, '1 Single Bed', 'Perfect for solo travelers looking for a comfortable and affordable stay with aircon and a quiet atmosphere.', 'Air Conditioning, Single Bed, High-speed Wi-Fi, Hot & Cold Shower, Reading Lamp', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'],
  ['standard-room', 'Standard Room', 'Standard', 1200, 2, 5, '1 Queen Bed', 'A cozy and clean room with aircon, private bathroom, free Wi-Fi, and flat screen TV. Perfect for solo or couples.', 'Air Conditioning, 1 Queen Bed, 32" Smart TV, Hot & Cold Shower, Electric Kettle', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
  ['deluxe-queen', 'Deluxe Queen Room', 'Deluxe', 1600, 2, 4, '1 Queen Bed + Balcony', 'Spacious deluxe room featuring scenic town and mountain views, luxury bedding, and a private balcony.', 'Balcony, Split-type Aircon, Smart TV with Netflix, Mini Fridge, Rainfall Shower', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
  ['deluxe-twin', 'Deluxe Twin Room', 'Deluxe', 1800, 2, 3, '2 Single Beds', 'Thoughtfully designed for friends or travel buddies seeking spacious convenience with premium amenities.', '2 Single Beds, Air Conditioning, Private Bath, Coffee Bar, High-speed Wi-Fi', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'],
  ['family-suite', 'Family Suite', 'Family', 2500, 4, 3, '1 Queen + 2 Single Beds', 'Ideal retreat for families. Features two partitioned sleeping areas, child-safe amenities, and dining space.', '2 Sleeping Areas, Dining Table, Smart TV, Refrigerator, Extra Pillows & Towels', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'],
  ['barkada-group', 'Barkada Group Room', 'Group', 3200, 6, 2, '3 Bunk Beds (Sleeps 6)', 'Built for groups, students, and teams traveling to Oriental Mindoro. High capacity with multiple lockers.', 'Individual Lockers, Power Outlets per Bed, 2 Bathrooms, High-speed Wi-Fi, Aircon', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
  ['executive-suite', 'Executive Bistro Suite', 'Suite', 3800, 2, 2, '1 King Bed + Lounge', 'Our premier suite featuring dedicated lounge area, complimentary bistro breakfast, and VIP keyless entry.', 'King Bed, Living Lounge, Free Breakfast Pass, Coffee Machine, Bathtub, City View', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80']
];

const defaultVouchers = [
  ['MINSU', 'percent', 99, null, 'Active'],
  ['SUMMER0123', 'percent', 30, '2027-10-11', 'Active'],
  ['CODE123', 'fixed', 35, '2026-12-06', 'Active'],
  ['HYTECHWELCOME', 'percent', 15, '2027-12-31', 'Active']
];

const defaultExtras = [
  ['Massage Relaxation', 300, 'per person / stay', '60 / 90 Minutes Unwind from your travels with our classic full-body massage. Using long, flowing strokes and gentle-to-medium pressure, this treatment eases surface tension, improves circulation, and leaves you in a state of deep calm.', 1],
  ['Airport / Port Shuttle', 450, 'per stay', 'Convenient door-to-door transport service from Calapan Port or Roxas Port directly to Hytech Hotel & Bistro.', 1],
  ['Extra Bed & Soft Pillow', 350, 'per night', 'High-density comfortable single foam mattress setup with premium duvet and fresh hypoallergenic pillow.', 1],
  ['Late Check-out Privilege (until 3:00 PM)', 250, 'per room', 'Relax at your own pace with extended check-out hours until 3:00 PM upon availability.', 1]
];

const defaultKeys = [
  ['Key 1', 'Assigned', 'Room 101', 'Marvin Digman', 'RES-8245281', 'Physical brass room key + magnetic power card'],
  ['Key 2', 'Available', 'Room 102', null, null, 'RFID Smart Card'],
  ['Key 3', 'Available', 'Room 103', null, null, 'RFID Smart Card'],
  ['Key 4', 'Available', 'Room 104', null, null, 'Physical key'],
  ['Key 5', 'Lost / damaged', 'Room 201', null, null, 'Reported lost Oct 2026, replacement ordered']
];

const defaultFood = [
  ['Filipino Buffet Breakfast', 'Breakfast', 350, '/ head', 'Traditional garlic rice, eggs, local longganisa, savory cured beef tapa, and seasonal fresh fruits.', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', 1],
  ['Fresh Seafood Platter', 'Seafood', 850, '/ platter', 'Freshly caught Mindoro crabs, buttered garlic prawns, grilled squid, and native dipping sauces.', 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=800&q=80', 1],
  ['Artisanal Coffee & Pastries', 'Coffee', 180, '+', 'Single origin brewed coffee paired with fresh oven-baked warm butter croissants or local bibingka.', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', 1],
  ['Sunset Mojito', 'Drinks', 240, '/ glass', 'Refreshing mint leaves, fresh calamansi lime, brown sugar, premium rum, and sparkling soda over crushed ice.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', 1],
  ['Tapsilog Morning Set', 'Breakfast', 180, '/ set', 'Marinated tender beef sirloin tapa, golden garlic fried rice, sunny-side egg, and pickled atchara.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', 1],
  ['Crispy Calamari Basket', 'Seafood', 320, '/ basket', 'Tender squid rings fried to golden crispiness served with bistro garlic aioli and sweet chili dip.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80', 1]
];

// -------------------------------------------------------------
// Database Initialization
// -------------------------------------------------------------
async function initDatabase() {
  if (mysql) {
    try {
      console.log(`[Database] Attempting connection to MySQL (XAMPP) at ${dbConfig.host}:${dbConfig.port}...`);
      
      // Connect to MySQL server without database first to ensure hytech_hotel exists
      const serverConn = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        connectTimeout: 3000
      });
      await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await serverConn.end();

      // Create connection pool to the database
      mysqlPool = mysql.createPool({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test pool
      await mysqlPool.query('SELECT 1');
      activeDriver = 'mysql';
      console.log(`[Database] SUCCESS: Connected to MySQL (XAMPP phpMyAdmin) database: ${dbConfig.database}`);

      // Initialize MySQL tables
      await initMysqlTables();
      return;
    } catch (err) {
      console.warn(`[Database] MySQL not reachable at ${dbConfig.host}:${dbConfig.port} (${err.code || err.message}).`);
      console.log('[Database] Falling back to embedded SQLite database (data/hytech.db).');
    }
  }

  // Fallback to SQLite
  activeDriver = 'sqlite';
  initSqliteTables();
  console.log('[Database] SQLite database initialized and ready.');
}

async function initMysqlTables() {
  const conn = mysqlPool;

  await conn.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(191) NOT NULL,
      type VARCHAR(50) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      capacity INT NOT NULL,
      inventory INT NOT NULL DEFAULT 1,
      bed_type VARCHAR(100) NOT NULL,
      description TEXT,
      amenities TEXT,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS extras (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      billing_unit VARCHAR(50) NOT NULL,
      description TEXT,
      is_available TINYINT(1) NOT NULL DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(100) UNIQUE NOT NULL,
      discount_type VARCHAR(20) NOT NULL,
      discount_value DECIMAL(10,2) NOT NULL,
      valid_until VARCHAR(50) DEFAULT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`keys\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      key_name VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Available',
      room_number VARCHAR(50) DEFAULT NULL,
      assigned_guest VARCHAR(191) DEFAULT NULL,
      booking_id VARCHAR(100) DEFAULT NULL,
      notes TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS food_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      category VARCHAR(50) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      price_unit VARCHAR(50) NOT NULL DEFAULT '',
      description TEXT,
      image_url TEXT,
      is_available TINYINT(1) NOT NULL DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS food_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(100) UNIQUE NOT NULL,
      guest_name VARCHAR(191) NOT NULL,
      guest_phone VARCHAR(50) NOT NULL,
      items_json LONGTEXT NOT NULL,
      special_request TEXT,
      deliver_to VARCHAR(100) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Preparing',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reference_id VARCHAR(100) UNIQUE NOT NULL,
      guest_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      room_id INT DEFAULT NULL,
      room_name VARCHAR(191) NOT NULL,
      room_number VARCHAR(100) DEFAULT 'Assigned once confirmed',
      guest_count INT NOT NULL DEFAULT 1,
      check_in VARCHAR(50) NOT NULL,
      check_out VARCHAR(50) NOT NULL,
      nights INT NOT NULL DEFAULT 1,
      room_charges DECIMAL(10,2) NOT NULL,
      discount_code VARCHAR(100) DEFAULT NULL,
      discount_amount DECIMAL(10,2) DEFAULT 0.00,
      extras_json LONGTEXT,
      extras_amount DECIMAL(10,2) DEFAULT 0.00,
      total_amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      payment_reference VARCHAR(100) DEFAULT NULL,
      payment_status VARCHAR(50) NOT NULL DEFAULT 'Unpaid',
      special_requests TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_reference VARCHAR(100) DEFAULT NULL,
      guest_name VARCHAR(191) NOT NULL,
      room_name VARCHAR(191) DEFAULT NULL,
      rating INT NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      email VARCHAR(191) UNIQUE NOT NULL,
      phone VARCHAR(50) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Seed data if empty
  const [roomRows] = await conn.query('SELECT COUNT(*) as count FROM rooms');
  if (roomRows[0].count === 0) {
    console.log('[Database] Seeding initial data into MySQL...');
    for (const r of defaultRooms) {
      await conn.query(
        'INSERT INTO rooms (code, name, type, price, capacity, inventory, bed_type, description, amenities, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        r
      );
    }
    for (const v of defaultVouchers) {
      await conn.query('INSERT INTO vouchers (code, discount_type, discount_value, valid_until, status) VALUES (?, ?, ?, ?, ?)', v);
    }
    for (const e of defaultExtras) {
      await conn.query('INSERT INTO extras (name, price, billing_unit, description, is_available) VALUES (?, ?, ?, ?, ?)', e);
    }
    for (const k of defaultKeys) {
      await conn.query('INSERT INTO `keys` (key_name, status, room_number, assigned_guest, booking_id, notes) VALUES (?, ?, ?, ?, ?, ?)', k);
    }
    for (const f of defaultFood) {
      await conn.query('INSERT INTO food_items (name, category, price, price_unit, description, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)', f);
    }
    await conn.query('INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)', ['Marvin Digman', 'guesthotel968@gmail.com', '09319505863']);
    await conn.query('INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)', ['Carl Faa', 'carlfaa@hytech.ph', '09141278921']);
    await conn.query(
      `INSERT INTO bookings (
        reference_id, guest_name, email, phone, room_id, room_name, room_number,
        guest_count, check_in, check_out, nights, room_charges, discount_code,
        discount_amount, extras_json, extras_amount, total_amount, payment_method,
        payment_reference, payment_status, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'RES-8245281', 'Marvin Digman', 'guesthotel968@gmail.com', '09319505863', 1, 'Economy Fan Room', 'Room 101',
        2, '2026-11-17', '2026-11-18', 1, 800, null, 0, '[]', 0, 800, 'GCash', '112233445566', 'Paid', 'Early morning check-in', 'Confirmed'
      ]
    );
    await conn.query(
      `INSERT INTO bookings (
        reference_id, guest_name, email, phone, room_id, room_name, room_number,
        guest_count, check_in, check_out, nights, room_charges, discount_code,
        discount_amount, extras_json, extras_amount, total_amount, payment_method,
        payment_reference, payment_status, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'RES-E6F42079C1FF43', 'Carl Faa', 'guesthotel968@gmail.com', '09141278921', 2, 'Solo Room', 'Room 102',
        1, '2026-11-18', '2026-11-19', 1, 1000, 'MINSU', 990, JSON.stringify([{ name: 'Massage Relaxation', price: 300 }]), 300, 310, 'GCash', '224466880011', 'Unpaid', 'Please prepare quiet room facing garden', 'Pending'
      ]
    );
    await conn.query(
      'INSERT INTO food_orders (order_id, guest_name, guest_phone, items_json, special_request, deliver_to, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['ORD-0185185', 'Guest Hotel', '091319505863', JSON.stringify([{ name: 'Sunset Mojito', quantity: 2, price: 240, image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80' }]), '', 'Table 3', 480, 'Preparing']
    );
    await conn.query(
      'INSERT INTO food_orders (order_id, guest_name, guest_phone, items_json, special_request, deliver_to, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['ORD-9485137', 'Guest Hotel', '09378836261', JSON.stringify([{ name: 'Tapsilog Morning Set', quantity: 5, price: 180, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' }]), 'EXTRA RICE', 'TABLE 2', 900, 'Served']
    );
    await conn.query(
      'INSERT INTO reviews (booking_reference, guest_name, room_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      ['RES-8245281', 'Marvin Digman', 'Economy Fan Room', 5, 'Super clean rooms and very accommodating staff! The bistro breakfast was delicious and affordable. Will definitely come back when visiting Bongabong!']
    );
    await conn.query(
      'INSERT INTO reviews (booking_reference, guest_name, room_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      ['RES-SAMPLE01', 'Elena Soriano', 'Standard Room', 5, 'Exceptional hospitality! Location is great, Wi-Fi is fast, and check-in via GCash was seamless.']
    );
  }
}

function initSqliteTables() {
  const sqldb = getSqliteDb();

  sqldb.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      price REAL NOT NULL,
      capacity INTEGER NOT NULL,
      inventory INTEGER NOT NULL DEFAULT 1,
      bed_type TEXT NOT NULL,
      description TEXT,
      amenities TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS extras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      billing_unit TEXT NOT NULL,
      description TEXT,
      is_available INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS vouchers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      valid_until TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Available',
      room_number TEXT,
      assigned_guest TEXT,
      booking_id TEXT,
      notes TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      price_unit TEXT NOT NULL DEFAULT '',
      description TEXT,
      image_url TEXT,
      is_available INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS food_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      guest_name TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      items_json TEXT NOT NULL,
      special_request TEXT,
      deliver_to TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Preparing',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_id TEXT UNIQUE NOT NULL,
      guest_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      room_id INTEGER,
      room_name TEXT NOT NULL,
      room_number TEXT DEFAULT 'Assigned once confirmed',
      guest_count INTEGER NOT NULL DEFAULT 1,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      nights INTEGER NOT NULL DEFAULT 1,
      room_charges REAL NOT NULL,
      discount_code TEXT,
      discount_amount REAL DEFAULT 0,
      extras_json TEXT DEFAULT '[]',
      extras_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_reference TEXT,
      payment_status TEXT NOT NULL DEFAULT 'Unpaid',
      special_requests TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_reference TEXT,
      guest_name TEXT NOT NULL,
      room_name TEXT,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const count = sqldb.prepare('SELECT COUNT(*) as count FROM rooms').get().count;
  if (count === 0) {
    const insertRoom = sqldb.prepare(`
      INSERT INTO rooms (code, name, type, price, capacity, inventory, bed_type, description, amenities, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of defaultRooms) insertRoom.run(...r);

    const insertVoucher = sqldb.prepare(`
      INSERT INTO vouchers (code, discount_type, discount_value, valid_until, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const v of defaultVouchers) insertVoucher.run(...v);

    const insertExtra = sqldb.prepare(`
      INSERT INTO extras (name, price, billing_unit, description, is_available)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const e of defaultExtras) insertExtra.run(...e);

    const insertKey = sqldb.prepare(`
      INSERT INTO keys (key_name, status, room_number, assigned_guest, booking_id, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const k of defaultKeys) insertKey.run(...k);

    const insertFood = sqldb.prepare(`
      INSERT INTO food_items (name, category, price, price_unit, description, image_url, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const f of defaultFood) insertFood.run(...f);

    const insertClient = sqldb.prepare(`INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)`);
    insertClient.run('Marvin Digman', 'guesthotel968@gmail.com', '09319505863');
    insertClient.run('Carl Faa', 'carlfaa@hytech.ph', '09141278921');

    const insertBooking = sqldb.prepare(`
      INSERT INTO bookings (
        reference_id, guest_name, email, phone, room_id, room_name, room_number,
        guest_count, check_in, check_out, nights, room_charges, discount_code,
        discount_amount, extras_json, extras_amount, total_amount, payment_method,
        payment_reference, payment_status, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBooking.run('RES-8245281', 'Marvin Digman', 'guesthotel968@gmail.com', '09319505863', 1, 'Economy Fan Room', 'Room 101', 2, '2026-11-17', '2026-11-18', 1, 800, null, 0, '[]', 0, 800, 'GCash', '112233445566', 'Paid', 'Early morning check-in', 'Confirmed');
    insertBooking.run('RES-E6F42079C1FF43', 'Carl Faa', 'guesthotel968@gmail.com', '09141278921', 2, 'Solo Room', 'Room 102', 1, '2026-11-18', '2026-11-19', 1, 1000, 'MINSU', 990, JSON.stringify([{ name: 'Massage Relaxation', price: 300 }]), 300, 310, 'GCash', '224466880011', 'Unpaid', 'Please prepare quiet room facing garden', 'Pending');

    const insertOrder = sqldb.prepare(`
      INSERT INTO food_orders (order_id, guest_name, guest_phone, items_json, special_request, deliver_to, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertOrder.run('ORD-0185185', 'Guest Hotel', '091319505863', JSON.stringify([{ name: 'Sunset Mojito', quantity: 2, price: 240, image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80' }]), '', 'Table 3', 480, 'Preparing');
    insertOrder.run('ORD-9485137', 'Guest Hotel', '09378836261', JSON.stringify([{ name: 'Tapsilog Morning Set', quantity: 5, price: 180, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' }]), 'EXTRA RICE', 'TABLE 2', 900, 'Served');

    const insertReview = sqldb.prepare(`
      INSERT INTO reviews (booking_reference, guest_name, room_name, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertReview.run('RES-8245281', 'Marvin Digman', 'Economy Fan Room', 5, 'Super clean rooms and very accommodating staff! The bistro breakfast was delicious and affordable. Will definitely come back when visiting Bongabong!');
    insertReview.run('RES-SAMPLE01', 'Elena Soriano', 'Standard Room', 5, 'Exceptional hospitality! Location is great, Wi-Fi is fast, and check-in via GCash was seamless.');
  }
}

// -------------------------------------------------------------
// Unified Query Interface
// -------------------------------------------------------------
const db = {
  getDriverName() {
    return activeDriver;
  },

  async all(sql, ...params) {
    const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    if (activeDriver === 'mysql' && mysqlPool) {
      const [rows] = await mysqlPool.query(sql, flatParams);
      return rows;
    } else {
      const sqldb = getSqliteDb();
      return sqldb.prepare(sql).all(...flatParams);
    }
  },

  async get(sql, ...params) {
    const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    if (activeDriver === 'mysql' && mysqlPool) {
      const [rows] = await mysqlPool.query(sql, flatParams);
      return rows[0] || undefined;
    } else {
      const sqldb = getSqliteDb();
      return sqldb.prepare(sql).get(...flatParams);
    }
  },

  async run(sql, ...params) {
    const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    if (activeDriver === 'mysql' && mysqlPool) {
      const [result] = await mysqlPool.query(sql, flatParams);
      return {
        lastInsertRowid: result.insertId,
        changes: result.affectedRows
      };
    } else {
      const sqldb = getSqliteDb();
      const res = sqldb.prepare(sql).run(...flatParams);
      return {
        lastInsertRowid: Number(res.lastInsertRowid),
        changes: Number(res.changes)
      };
    }
  },

  async exec(sql) {
    if (activeDriver === 'mysql' && mysqlPool) {
      await mysqlPool.query(sql);
    } else {
      getSqliteDb().exec(sql);
    }
  },

  prepare(sql) {
    return {
      all: async (...params) => db.all(sql, ...params),
      get: async (...params) => db.get(sql, ...params),
      run: async (...params) => db.run(sql, ...params)
    };
  }
};

// Start initialization immediately
const initPromise = initDatabase();

module.exports = {
  db,
  initDatabase,
  initPromise
};
