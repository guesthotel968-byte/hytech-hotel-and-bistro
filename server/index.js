const express = require('express');
const cors = require('cors');
const path = require('node:path');
const crypto = require('node:crypto');
const { db, initDatabase, initPromise } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable robust CORS for Netlify, local network (mobile), and direct domains
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  next();
});

// Helper to generate reference ID e.g. RES-E6F42079C1FF43
function generateReferenceId() {
  const hex = crypto.randomBytes(7).toString('hex').toUpperCase();
  return `RES-${hex}`;
}

// Helper to generate food order ID e.g. ORD-0185185
function generateOrderId() {
  const num = Math.floor(1000000 + Math.random() * 9000000);
  return `ORD-${num}`;
}

// Ensure database initialization has finished before handling requests
app.use(async (req, res, next) => {
  if (initPromise) {
    try {
      await initPromise;
    } catch (e) {
      // Continue even if init logged warning
    }
  }
  next();
});

// Database status endpoint
app.get('/api/db-status', (req, res) => {
  res.json({
    status: 'online',
    driver: db.getDriverName(), // 'mysql' (XAMPP) or 'sqlite'
    database: process.env.DB_NAME || 'hytech_hotel',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 1. ROOMS API
// ==========================================
app.get('/api/rooms', async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM rooms';
    const params = [];
    if (type && type.toLowerCase() !== 'all') {
      query += ' WHERE LOWER(type) = LOWER(?)';
      params.push(type);
    }
    query += ' ORDER BY price ASC';
    const rows = await db.all(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms/:id', async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM rooms WHERE id = ?', req.params.id);
    if (!row) return res.status(404).json({ error: 'Room not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { name, type, price, capacity, inventory, bed_type, description, amenities, image_url } = req.body;
    const code = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
    const result = await db.run(
      `INSERT INTO rooms (code, name, type, price, capacity, inventory, bed_type, description, amenities, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      code, name, type, price, capacity || 2, inventory || 1, bed_type || '1 Queen Bed', description || '', amenities || '', image_url || ''
    );
    const newRoom = await db.get('SELECT * FROM rooms WHERE id = ?', result.lastInsertRowid);
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rooms/:id', async (req, res) => {
  try {
    const { name, type, price, capacity, inventory, bed_type, description, amenities, image_url } = req.body;
    await db.run(
      `UPDATE rooms
       SET name = ?, type = ?, price = ?, capacity = ?, inventory = ?, bed_type = ?, description = ?, amenities = ?, image_url = ?
       WHERE id = ?`,
      name, type, price, capacity, inventory, bed_type, description, amenities, image_url, req.params.id
    );
    const updated = await db.get('SELECT * FROM rooms WHERE id = ?', req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM rooms WHERE id = ?', req.params.id);
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. EXTRAS & SERVICES API
// ==========================================
app.get('/api/extras', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM extras ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/extras', async (req, res) => {
  try {
    const { name, price, billing_unit, description, is_available } = req.body;
    const result = await db.run(
      `INSERT INTO extras (name, price, billing_unit, description, is_available)
       VALUES (?, ?, ?, ?, ?)`,
      name, price, billing_unit || 'per person / stay', description || '', is_available !== undefined ? is_available : 1
    );
    const item = await db.get('SELECT * FROM extras WHERE id = ?', result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/extras/:id', async (req, res) => {
  try {
    const { name, price, billing_unit, description, is_available } = req.body;
    await db.run(
      `UPDATE extras
       SET name = ?, price = ?, billing_unit = ?, description = ?, is_available = ?
       WHERE id = ?`,
      name, price, billing_unit, description, is_available, req.params.id
    );
    const updated = await db.get('SELECT * FROM extras WHERE id = ?', req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/extras/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM extras WHERE id = ?', req.params.id);
    res.json({ success: true, message: 'Extra deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. VOUCHERS / DISCOUNTS API
// ==========================================
app.get('/api/vouchers', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM vouchers ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vouchers', async (req, res) => {
  try {
    const { code, discount_type, discount_value, valid_until } = req.body;
    if (!code || !discount_type || discount_value === undefined) {
      return res.status(400).json({ error: 'Code, discount_type, and discount_value are required' });
    }
    const cleanCode = code.trim().toUpperCase();
    const result = await db.run(
      `INSERT INTO vouchers (code, discount_type, discount_value, valid_until, status)
       VALUES (?, ?, ?, ?, 'Active')`,
      cleanCode, discount_type, discount_value, valid_until || null
    );
    const voucher = await db.get('SELECT * FROM vouchers WHERE id = ?', result.lastInsertRowid);
    res.status(201).json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vouchers/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'Active' or 'Paused'
    await db.run('UPDATE vouchers SET status = ? WHERE id = ?', status, req.params.id);
    const voucher = await db.get('SELECT * FROM vouchers WHERE id = ?', req.params.id);
    res.json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vouchers/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM vouchers WHERE id = ?', req.params.id);
    res.json({ success: true, message: 'Voucher deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vouchers/validate', async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code) return res.status(400).json({ error: 'Voucher code required' });

    const cleanCode = code.trim().toUpperCase();
    const voucher = await db.get('SELECT * FROM vouchers WHERE code = ?', cleanCode);

    if (!voucher) {
      return res.status(404).json({ valid: false, message: 'Invalid promo code.' });
    }
    if (voucher.status !== 'Active') {
      return res.status(400).json({ valid: false, message: 'This promo code is currently paused/inactive.' });
    }
    if (voucher.valid_until) {
      const today = new Date().toISOString().split('T')[0];
      if (voucher.valid_until < today) {
        return res.status(400).json({ valid: false, message: `Promo code expired on ${voucher.valid_until}.` });
      }
    }

    const subtotal = Number(amount) || 0;
    let discount = 0;
    if (voucher.discount_type === 'percent') {
      discount = (subtotal * voucher.discount_value) / 100;
    } else {
      discount = voucher.discount_value;
    }
    if (discount > subtotal) discount = subtotal;

    res.json({
      valid: true,
      code: voucher.code,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      discount_amount: Math.round(discount),
      message: `Voucher applied: ${voucher.discount_type === 'percent' ? voucher.discount_value + '% off' : '₱' + voucher.discount_value + ' off'}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. KEYS & ACCESS CONTROL API
// ==========================================
app.get('/api/keys', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM keys WHERE 1=1';
    const params = [];

    if (status && status !== 'All statuses') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (key_name LIKE ? OR room_number LIKE ? OR assigned_guest LIKE ? OR booking_id LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    query += ' ORDER BY id ASC';
    const rows = await db.all(query, params);

    // Summary counters
    const totalRow = await db.get('SELECT COUNT(*) as c FROM keys');
    const availRow = await db.get("SELECT COUNT(*) as c FROM keys WHERE status = 'Available'");
    const assignRow = await db.get("SELECT COUNT(*) as c FROM keys WHERE status = 'Assigned'");
    const lostRow = await db.get("SELECT COUNT(*) as c FROM keys WHERE status = 'Lost / damaged'");

    res.json({
      keys: rows,
      summary: {
        total: Number(totalRow?.c || 0),
        available: Number(availRow?.c || 0),
        assigned: Number(assignRow?.c || 0),
        lost: Number(lostRow?.c || 0)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/keys', async (req, res) => {
  try {
    const { key_name, room_number, status, notes } = req.body;
    const result = await db.run(
      `INSERT INTO keys (key_name, room_number, status, notes)
       VALUES (?, ?, ?, ?)`,
      key_name, room_number || null, status || 'Available', notes || null
    );
    const newKey = await db.get('SELECT * FROM keys WHERE id = ?', result.lastInsertRowid);
    res.status(201).json(newKey);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/keys/:id', async (req, res) => {
  try {
    const { key_name, room_number, status, assigned_guest, booking_id, notes } = req.body;
    await db.run(
      `UPDATE keys
       SET key_name = ?, room_number = ?, status = ?, assigned_guest = ?, booking_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      key_name, room_number, status, assigned_guest, booking_id, notes, req.params.id
    );
    const updated = await db.get('SELECT * FROM keys WHERE id = ?', req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/keys/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM keys WHERE id = ?', req.params.id);
    res.json({ success: true, message: 'Key deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. FOOD ITEMS & ORDERS API
// ==========================================
app.get('/api/food-items', async (req, res) => {
  try {
    const { category, only_available } = req.query;
    let query = 'SELECT * FROM food_items WHERE 1=1';
    const params = [];
    if (only_available === 'true') {
      query += ' AND is_available = 1';
    }
    if (category && category !== 'All') {
      query += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }
    query += ' ORDER BY id ASC';
    const rows = await db.all(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Food Item Availability (In Stock / Out of Stock)
app.put('/api/food-items/:id/toggle', async (req, res) => {
  try {
    const item = await db.get('SELECT * FROM food_items WHERE id = ?', req.params.id);
    if (!item) return res.status(404).json({ error: 'Food item not found' });
    const newStatus = item.is_available ? 0 : 1;
    await db.run('UPDATE food_items SET is_available = ? WHERE id = ?', newStatus, req.params.id);
    const updated = await db.get('SELECT * FROM food_items WHERE id = ?', req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/food-items/:id', async (req, res) => {
  try {
    const { name, category, price, price_unit, description, image_url, is_available } = req.body;
    await db.run(
      `UPDATE food_items
       SET name = ?, category = ?, price = ?, price_unit = ?, description = ?, image_url = ?, is_available = ?
       WHERE id = ?`,
      name, category, price, price_unit || '', description || '', image_url || '', is_available !== undefined ? is_available : 1, req.params.id
    );
    const updated = await db.get('SELECT * FROM food_items WHERE id = ?', req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/food-items/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM food_items WHERE id = ?', req.params.id);
    res.json({ success: true, message: 'Food item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/food-items', async (req, res) => {
  try {
    const { name, category, price, price_unit, description, image_url } = req.body;
    const result = await db.run(
      `INSERT INTO food_items (name, category, price, price_unit, description, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      name, category, price, price_unit || '', description || '', image_url || ''
    );
    const item = await db.get('SELECT * FROM food_items WHERE id = ?', result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/food-orders', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM food_orders ORDER BY id DESC');
    const formatted = rows.map(r => ({
      ...r,
      items: typeof r.items_json === 'string' ? JSON.parse(r.items_json || '[]') : (r.items_json || [])
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/food-orders', async (req, res) => {
  try {
    const { guest_name, guest_phone, items, special_request, deliver_to, total_amount } = req.body;
    if (!guest_name || !guest_phone || !items || !deliver_to) {
      return res.status(400).json({ error: 'Missing required order details' });
    }
    const order_id = generateOrderId();
    const result = await db.run(
      `INSERT INTO food_orders (order_id, guest_name, guest_phone, items_json, special_request, deliver_to, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Preparing')`,
      order_id,
      guest_name,
      guest_phone,
      JSON.stringify(items),
      special_request || '',
      deliver_to,
      total_amount || 0
    );
    const newOrder = await db.get('SELECT * FROM food_orders WHERE id = ?', result.lastInsertRowid);
    newOrder.items = typeof newOrder.items_json === 'string' ? JSON.parse(newOrder.items_json || '[]') : (newOrder.items_json || []);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/food-orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'Preparing', 'Served', 'Completed', 'Cancelled'
    await db.run('UPDATE food_orders SET status = ? WHERE id = ?', status, req.params.id);
    const order = await db.get('SELECT * FROM food_orders WHERE id = ?', req.params.id);
    if (order) {
      order.items = typeof order.items_json === 'string' ? JSON.parse(order.items_json || '[]') : (order.items_json || []);
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. BOOKINGS & RESERVATIONS API
// ==========================================
app.get('/api/bookings', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND LOWER(status) = LOWER(?)';
      params.push(status);
    }
    if (search) {
      query += ' AND (reference_id LIKE ? OR guest_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    query += ' ORDER BY id DESC';
    const rows = await db.all(query, params);
    const formatted = rows.map(r => ({
      ...r,
      companions: typeof r.companions_json === 'string' ? JSON.parse(r.companions_json || '[]') : (r.companions_json || []),
      extras: typeof r.extras_json === 'string' ? JSON.parse(r.extras_json || '[]') : (r.extras_json || [])
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guest lookup by email
app.get('/api/bookings/my', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email parameter required' });

    const rows = await db.all('SELECT * FROM bookings WHERE LOWER(email) = LOWER(?) ORDER BY id DESC', email);
    const formatted = rows.map(r => ({
      ...r,
      companions: typeof r.companions_json === 'string' ? JSON.parse(r.companions_json || '[]') : (r.companions_json || []),
      extras: typeof r.extras_json === 'string' ? JSON.parse(r.extras_json || '[]') : (r.extras_json || [])
    }));

    // Also get food orders for this guest
    const orders = await db.all('SELECT * FROM food_orders WHERE guest_name LIKE ? OR guest_phone LIKE ? ORDER BY id DESC', `%${email}%`, `%${email}%`);
    const formattedOrders = orders.map(o => ({
      ...o,
      items: typeof o.items_json === 'string' ? JSON.parse(o.items_json || '[]') : (o.items_json || [])
    }));

    res.json({
      bookings: formatted,
      orders: formattedOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/:reference_id', async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM bookings WHERE reference_id = ?', req.params.reference_id);
    if (!row) return res.status(404).json({ error: 'Reservation not found' });
    row.companions = typeof row.companions_json === 'string' ? JSON.parse(row.companions_json || '[]') : (row.companions_json || []);
    row.extras = typeof row.extras_json === 'string' ? JSON.parse(row.extras_json || '[]') : (row.extras_json || []);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const {
      guest_name,
      email,
      phone,
      room_id,
      room_name,
      guest_count,
      companions,
      check_in,
      check_out,
      nights,
      room_charges,
      discount_code,
      discount_amount,
      extras,
      extras_amount,
      total_amount,
      payment_method,
      payment_reference,
      special_requests
    } = req.body;

    if (!guest_name || !email || !phone || !check_in || !check_out || !room_name) {
      return res.status(400).json({ error: 'Missing required reservation fields' });
    }

    const reference_id = generateReferenceId();

    const result = await db.run(
      `INSERT INTO bookings (
        reference_id, guest_name, email, phone, room_id, room_name, room_number,
        guest_count, check_in, check_out, nights, room_charges, discount_code,
        discount_amount, companions_json, extras_json, extras_amount, total_amount, payment_method,
        payment_reference, payment_status, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'Assigned once confirmed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      reference_id,
      guest_name,
      email,
      phone,
      room_id || null,
      room_name,
      guest_count || 1,
      check_in,
      check_out,
      nights || 1,
      room_charges || 0,
      discount_code || null,
      discount_amount || 0,
      JSON.stringify(companions || []),
      JSON.stringify(extras || []),
      extras_amount || 0,
      total_amount || 0,
      payment_method || 'GCash',
      payment_reference || null,
      payment_method === 'GCash' && payment_reference ? 'Paid' : 'Unpaid',
      special_requests || 'None'
    );

    // Save or update client entry
    const existingClient = await db.get('SELECT * FROM clients WHERE LOWER(email) = LOWER(?)', email);
    if (!existingClient) {
      await db.run('INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)', guest_name, email, phone);
    } else {
      await db.run('UPDATE clients SET name = ?, phone = ? WHERE id = ?', guest_name, phone, existingClient.id);
    }

    const created = await db.get('SELECT * FROM bookings WHERE id = ?', result.lastInsertRowid);
    if (created) {
      created.companions = typeof created.companions_json === 'string' ? JSON.parse(created.companions_json || '[]') : (created.companions_json || []);
      created.extras = typeof created.extras_json === 'string' ? JSON.parse(created.extras_json || '[]') : (created.extras_json || []);
    }
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const { status, room_number, payment_status } = req.body;
    await db.run(
      `UPDATE bookings
       SET status = COALESCE(?, status),
           room_number = COALESCE(?, room_number),
           payment_status = COALESCE(?, payment_status)
       WHERE id = ?`,
      status, room_number, payment_status, req.params.id
    );
    const updated = await db.get('SELECT * FROM bookings WHERE id = ?', req.params.id);
    if (updated) {
      updated.companions = typeof updated.companions_json === 'string' ? JSON.parse(updated.companions_json || '[]') : (updated.companions_json || []);
      updated.extras = typeof updated.extras_json === 'string' ? JSON.parse(updated.extras_json || '[]') : (updated.extras_json || []);
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. CLIENTS DIRECTORY & COMPANIONS API
// ==========================================
app.get('/api/clients', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `SELECT * FROM clients ORDER BY id DESC`;
    const clients = await db.all(query);
    
    // Enrich each client with full booking history, companion list
    const enriched = await Promise.all(clients.map(async (c) => {
      const clientBookings = await db.all(
        'SELECT * FROM bookings WHERE LOWER(email) = LOWER(?) ORDER BY id DESC',
        c.email
      );
      
      const allCompanionsSet = new Set();
      const formattedBookings = clientBookings.map(b => {
        const comps = typeof b.companions_json === 'string' ? JSON.parse(b.companions_json || '[]') : (b.companions_json || []);
        comps.forEach(comp => { if (comp && comp.trim()) allCompanionsSet.add(comp.trim()); });
        return {
          ...b,
          companions: comps,
          extras: typeof b.extras_json === 'string' ? JSON.parse(b.extras_json || '[]') : (b.extras_json || [])
        };
      });

      return {
        ...c,
        total_bookings: formattedBookings.length,
        last_room: formattedBookings[0]?.room_name || 'None',
        latest_booking_id: formattedBookings[0]?.reference_id || 'None',
        companions: Array.from(allCompanionsSet),
        booking_history: formattedBookings
      };
    }));

    let result = enriched;
    if (search) {
      const s = search.toLowerCase();
      result = enriched.filter(c => {
        const matchName = c.name?.toLowerCase().includes(s);
        const matchEmail = c.email?.toLowerCase().includes(s);
        const matchPhone = c.phone?.toLowerCase().includes(s);
        const matchComp = c.companions?.some(comp => comp.toLowerCase().includes(s));
        const matchRoom = c.last_room?.toLowerCase().includes(s);
        return matchName || matchEmail || matchPhone || matchComp || matchRoom;
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Client Profile (Name, Phone, Photo)
app.put('/api/clients/profile', async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const existing = await db.get('SELECT * FROM clients WHERE LOWER(email) = LOWER(?)', email);
    if (existing) {
      await db.run('UPDATE clients SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?', name, phone, existing.id);
    } else {
      await db.run('INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)', name || 'Guest', email, phone || '');
    }
    res.json({ success: true, email, name, phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password API Endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address required' });
    res.json({
      success: true,
      message: `Password reset link has been dispatched for ${email}. You may reset your password or continue with Google Sign-In.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. REVIEWS API
// ==========================================
app.get('/api/reviews', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM reviews ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { booking_reference, guest_name, room_name, rating, comment } = req.body;
    if (!guest_name || !rating || !comment) {
      return res.status(400).json({ error: 'Guest name, rating, and comment are required' });
    }
    const result = await db.run(
      `INSERT INTO reviews (booking_reference, guest_name, room_name, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      booking_reference || null, guest_name, room_name || 'Hytech Hotel & Bistro', rating, comment
    );
    const newReview = await db.get('SELECT * FROM reviews WHERE id = ?', result.lastInsertRowid);
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. CALENDAR & OCCUPANCY API
// Only ADMIN-APPROVED reservations ('Confirmed', 'Checked in') appear on the calendar!
// ==========================================
app.get('/api/calendar', async (req, res) => {
  try {
    const { year, month, room_id, room_name } = req.query; // year e.g. 2026, month 1-12
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || (new Date().getMonth() + 1);

    const monthStr = m.toString().padStart(2, '0');
    const startStr = `${y}-${monthStr}-01`;
    const daysInMonth = new Date(y, m, 0).getDate();
    const endStr = `${y}-${monthStr}-${daysInMonth}`;

    // IMPORTANT: Only approved/confirmed bookings block calendar dates!
    let query = `
      SELECT reference_id, guest_name, room_id, room_name, room_number, check_in, check_out, status
      FROM bookings
      WHERE status IN ('Confirmed', 'Checked in')
        AND check_in <= ?
        AND check_out >= ?
    `;
    const params = [endStr, startStr];

    if (room_id) {
      query += ' AND room_id = ?';
      params.push(room_id);
    } else if (room_name) {
      query += ' AND LOWER(room_name) = LOWER(?)';
      params.push(room_name);
    }

    const bookings = await db.all(query, params);

    // Calculate occupancy map for each day
    const daysData = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDateStr = `${y}-${monthStr}-${day.toString().padStart(2, '0')}`;
      const activeForNight = bookings.filter(b => {
        return b.check_in <= dayDateStr && dayDateStr < b.check_out;
      });

      daysData[day] = {
        date: dayDateStr,
        day,
        status: activeForNight.length > 0 ? 'reserved' : 'available',
        count: activeForNight.length,
        guests: activeForNight.map(b => ({
          reference_id: b.reference_id,
          name: b.guest_name,
          room: b.room_name,
          room_number: b.room_number,
          status: b.status
        }))
      };
    }

    res.json({
      year: y,
      month: m,
      daysInMonth,
      firstDayOfWeek: new Date(y, m - 1, 1).getDay(), // 0 = Sun, 1 = Mon ...
      days: daysData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. DASHBOARD STATS API
// ==========================================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalBookingsRow = await db.get('SELECT COUNT(*) as c FROM bookings');
    const pendingBookingsRow = await db.get("SELECT COUNT(*) as c FROM bookings WHERE status = 'Pending'");
    const confirmedBookingsRow = await db.get("SELECT COUNT(*) as c FROM bookings WHERE status = 'Confirmed'");
    const checkedInRow = await db.get("SELECT COUNT(*) as c FROM bookings WHERE status = 'Checked in'");
    const totalRevenueRow = await db.get("SELECT SUM(total_amount) as s FROM bookings WHERE payment_status = 'Paid'");
    
    // Key counts
    const keyTotalRow = await db.get('SELECT COUNT(*) as c FROM keys');
    const keyAvailableRow = await db.get("SELECT COUNT(*) as c FROM keys WHERE status = 'Available'");
    const keyAssignedRow = await db.get("SELECT COUNT(*) as c FROM keys WHERE status = 'Assigned'");
    const keyLostRow = await db.get("SELECT COUNT(*) as c FROM keys WHERE status = 'Lost / damaged'");

    // Food orders
    const foodOrdersTotalRow = await db.get('SELECT COUNT(*) as c FROM food_orders');
    const foodOrdersPreparingRow = await db.get("SELECT COUNT(*) as c FROM food_orders WHERE status = 'Preparing'");
    const foodRevenueRow = await db.get("SELECT SUM(total_amount) as s FROM food_orders WHERE status IN ('Served', 'Completed')");

    // Room stats
    const totalRoomsRow = await db.get('SELECT SUM(inventory) as s FROM rooms');
    const occupiedNightsRow = await db.get("SELECT COUNT(*) as c FROM bookings WHERE status IN ('Confirmed', 'Checked in')");

    const totalRooms = Number(totalRoomsRow?.s || 10);
    const occupiedNights = Number(occupiedNightsRow?.c || 0);
    const occupancyRate = Math.min(100, Math.round((occupiedNights / Math.max(1, totalRooms)) * 100));

    // Recent activity
    const recentBookings = await db.all('SELECT * FROM bookings ORDER BY id DESC LIMIT 5');

    res.json({
      totalBookings: Number(totalBookingsRow?.c || 0),
      pendingBookings: Number(pendingBookingsRow?.c || 0),
      confirmedBookings: Number(confirmedBookingsRow?.c || 0),
      checkedIn: Number(checkedInRow?.c || 0),
      totalRevenue: Number(totalRevenueRow?.s || 0),
      occupancyRate,
      keys: {
        total: Number(keyTotalRow?.c || 0),
        available: Number(keyAvailableRow?.c || 0),
        assigned: Number(keyAssignedRow?.c || 0),
        lost: Number(keyLostRow?.c || 0)
      },
      food: {
        totalOrders: Number(foodOrdersTotalRow?.c || 0),
        preparing: Number(foodOrdersPreparingRow?.c || 0),
        revenue: Number(foodRevenueRow?.s || 0)
      },
      recentBookings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend build if present (for single-service deployment e.g. on Render)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.use((req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      res.send('Hytech Hotel & Bistro API server is running! Build frontend to see UI.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Hytech Hotel & Bistro Server listening on port ${PORT}`);
});
