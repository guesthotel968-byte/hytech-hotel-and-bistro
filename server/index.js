const express = require('express');
const cors = require('cors');
const path = require('node:path');
const crypto = require('node:crypto');
const { db, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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

// ==========================================
// 1. ROOMS API
// ==========================================
app.get('/api/rooms', (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM rooms';
    const params = [];
    if (type && type.toLowerCase() !== 'all') {
      query += ' WHERE LOWER(type) = LOWER(?)';
      params.push(type);
    }
    query += ' ORDER BY price ASC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Room not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', (req, res) => {
  try {
    const { name, type, price, capacity, inventory, bed_type, description, amenities, image_url } = req.body;
    const code = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
    const stmt = db.prepare(`
      INSERT INTO rooms (code, name, type, price, capacity, inventory, bed_type, description, amenities, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(code, name, type, price, capacity || 2, inventory || 1, bed_type || '1 Queen Bed', description || '', amenities || '', image_url || '');
    const newRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rooms/:id', (req, res) => {
  try {
    const { name, type, price, capacity, inventory, bed_type, description, amenities, image_url } = req.body;
    const stmt = db.prepare(`
      UPDATE rooms
      SET name = ?, type = ?, price = ?, capacity = ?, inventory = ?, bed_type = ?, description = ?, amenities = ?, image_url = ?
      WHERE id = ?
    `);
    stmt.run(name, type, price, capacity, inventory, bed_type, description, amenities, image_url, req.params.id);
    const updated = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rooms/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM rooms WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. EXTRAS & SERVICES API
// ==========================================
app.get('/api/extras', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM extras ORDER BY id ASC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/extras', (req, res) => {
  try {
    const { name, price, billing_unit, description, is_available } = req.body;
    const stmt = db.prepare(`
      INSERT INTO extras (name, price, billing_unit, description, is_available)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, price, billing_unit || 'per person / stay', description || '', is_available !== undefined ? is_available : 1);
    const item = db.prepare('SELECT * FROM extras WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/extras/:id', (req, res) => {
  try {
    const { name, price, billing_unit, description, is_available } = req.body;
    const stmt = db.prepare(`
      UPDATE extras
      SET name = ?, price = ?, billing_unit = ?, description = ?, is_available = ?
      WHERE id = ?
    `);
    stmt.run(name, price, billing_unit, description, is_available, req.params.id);
    const updated = db.prepare('SELECT * FROM extras WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/extras/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM extras WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Extra deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. VOUCHERS / DISCOUNTS API
// ==========================================
app.get('/api/vouchers', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM vouchers ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vouchers', (req, res) => {
  try {
    const { code, discount_type, discount_value, valid_until } = req.body;
    if (!code || !discount_type || discount_value === undefined) {
      return res.status(400).json({ error: 'Code, discount_type, and discount_value are required' });
    }
    const cleanCode = code.trim().toUpperCase();
    const stmt = db.prepare(`
      INSERT INTO vouchers (code, discount_type, discount_value, valid_until, status)
      VALUES (?, ?, ?, ?, 'Active')
    `);
    const result = stmt.run(cleanCode, discount_type, discount_value, valid_until || null);
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vouchers/:id/status', (req, res) => {
  try {
    const { status } = req.body; // 'Active' or 'Paused'
    db.prepare('UPDATE vouchers SET status = ? WHERE id = ?').run(status, req.params.id);
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(req.params.id);
    res.json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vouchers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM vouchers WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Voucher deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vouchers/validate', (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code) return res.status(400).json({ error: 'Voucher code required' });

    const cleanCode = code.trim().toUpperCase();
    const voucher = db.prepare('SELECT * FROM vouchers WHERE code = ?').get(cleanCode);

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
app.get('/api/keys', (req, res) => {
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
    const rows = db.prepare(query).all(...params);

    // Also calculate summary counters
    const total = db.prepare('SELECT COUNT(*) as c FROM keys').get().c;
    const available = db.prepare("SELECT COUNT(*) as c FROM keys WHERE status = 'Available'").get().c;
    const assigned = db.prepare("SELECT COUNT(*) as c FROM keys WHERE status = 'Assigned'").get().c;
    const lost = db.prepare("SELECT COUNT(*) as c FROM keys WHERE status = 'Lost / damaged'").get().c;

    res.json({
      keys: rows,
      summary: { total, available, assigned, lost }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/keys', (req, res) => {
  try {
    const { key_name, room_number, status, notes } = req.body;
    const stmt = db.prepare(`
      INSERT INTO keys (key_name, room_number, status, notes)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(key_name, room_number || null, status || 'Available', notes || null);
    const newKey = db.prepare('SELECT * FROM keys WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newKey);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/keys/:id', (req, res) => {
  try {
    const { key_name, room_number, status, assigned_guest, booking_id, notes } = req.body;
    const stmt = db.prepare(`
      UPDATE keys
      SET key_name = ?, room_number = ?, status = ?, assigned_guest = ?, booking_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(key_name, room_number, status, assigned_guest, booking_id, notes, req.params.id);
    const updated = db.prepare('SELECT * FROM keys WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/keys/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM keys WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Key deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. FOOD ITEMS & ORDERS API
// ==========================================
app.get('/api/food-items', (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM food_items WHERE is_available = 1';
    const params = [];
    if (category && category !== 'All') {
      query += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }
    query += ' ORDER BY id ASC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/food-items', (req, res) => {
  try {
    const { name, category, price, price_unit, description, image_url } = req.body;
    const stmt = db.prepare(`
      INSERT INTO food_items (name, category, price, price_unit, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, category, price, price_unit || '', description || '', image_url || '');
    const item = db.prepare('SELECT * FROM food_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/food-orders', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM food_orders ORDER BY id DESC').all();
    const formatted = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items_json || '[]')
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/food-orders', (req, res) => {
  try {
    const { guest_name, guest_phone, items, special_request, deliver_to, total_amount } = req.body;
    if (!guest_name || !guest_phone || !items || !deliver_to) {
      return res.status(400).json({ error: 'Missing required order details' });
    }
    const order_id = generateOrderId();
    const stmt = db.prepare(`
      INSERT INTO food_orders (order_id, guest_name, guest_phone, items_json, special_request, deliver_to, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Preparing')
    `);
    const result = stmt.run(
      order_id,
      guest_name,
      guest_phone,
      JSON.stringify(items),
      special_request || '',
      deliver_to,
      total_amount || 0
    );
    const newOrder = db.prepare('SELECT * FROM food_orders WHERE id = ?').get(result.lastInsertRowid);
    newOrder.items = JSON.parse(newOrder.items_json);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/food-orders/:id/status', (req, res) => {
  try {
    const { status } = req.body; // 'Preparing', 'Served', 'Completed', 'Cancelled'
    db.prepare('UPDATE food_orders SET status = ? WHERE id = ?').run(status, req.params.id);
    const order = db.prepare('SELECT * FROM food_orders WHERE id = ?').get(req.params.id);
    if (order) order.items = JSON.parse(order.items_json);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. BOOKINGS & RESERVATIONS API
// ==========================================
app.get('/api/bookings', (req, res) => {
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
    const rows = db.prepare(query).all(...params);
    const formatted = rows.map(r => ({
      ...r,
      extras: JSON.parse(r.extras_json || '[]')
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guest lookup by email
app.get('/api/bookings/my', (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email parameter required' });

    const rows = db.prepare('SELECT * FROM bookings WHERE LOWER(email) = LOWER(?) ORDER BY id DESC').all(email);
    const formatted = rows.map(r => ({
      ...r,
      extras: JSON.parse(r.extras_json || '[]')
    }));

    // Also get food orders for this guest
    const orders = db.prepare('SELECT * FROM food_orders WHERE guest_name LIKE ? OR guest_phone LIKE ? ORDER BY id DESC').all(`%${email}%`, `%${email}%`);
    const formattedOrders = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items_json || '[]')
    }));

    res.json({
      bookings: formatted,
      orders: formattedOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/:reference_id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM bookings WHERE reference_id = ?').get(req.params.reference_id);
    if (!row) return res.status(404).json({ error: 'Reservation not found' });
    row.extras = JSON.parse(row.extras_json || '[]');
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', (req, res) => {
  try {
    const {
      guest_name,
      email,
      phone,
      room_id,
      room_name,
      guest_count,
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

    const stmt = db.prepare(`
      INSERT INTO bookings (
        reference_id, guest_name, email, phone, room_id, room_name, room_number,
        guest_count, check_in, check_out, nights, room_charges, discount_code,
        discount_amount, extras_json, extras_amount, total_amount, payment_method,
        payment_reference, payment_status, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'Assigned once confirmed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);

    const result = stmt.run(
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
      JSON.stringify(extras || []),
      extras_amount || 0,
      total_amount || 0,
      payment_method || 'GCash',
      payment_reference || null,
      payment_method === 'GCash' && payment_reference ? 'Paid' : 'Unpaid',
      special_requests || 'None'
    );

    // Save or update client entry
    const existingClient = db.prepare('SELECT * FROM clients WHERE LOWER(email) = LOWER(?)').get(email);
    if (!existingClient) {
      db.prepare('INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)').run(guest_name, email, phone);
    } else {
      db.prepare('UPDATE clients SET name = ?, phone = ? WHERE id = ?').run(guest_name, phone, existingClient.id);
    }

    const created = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
    created.extras = JSON.parse(created.extras_json || '[]');
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id', (req, res) => {
  try {
    const { status, room_number, payment_status, notes } = req.body;
    const stmt = db.prepare(`
      UPDATE bookings
      SET status = COALESCE(?, status),
          room_number = COALESCE(?, room_number),
          payment_status = COALESCE(?, payment_status)
      WHERE id = ?
    `);
    stmt.run(status, room_number, payment_status, req.params.id);
    const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (updated) updated.extras = JSON.parse(updated.extras_json || '[]');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. CLIENTS DIRECTORY API
// ==========================================
app.get('/api/clients', (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT c.*, 
        (SELECT b.room_name FROM bookings b WHERE LOWER(b.email) = LOWER(c.email) ORDER BY b.id DESC LIMIT 1) as last_room,
        (SELECT COUNT(*) FROM bookings b WHERE LOWER(b.email) = LOWER(c.email)) as total_bookings,
        (SELECT b.reference_id FROM bookings b WHERE LOWER(b.email) = LOWER(c.email) ORDER BY b.id DESC LIMIT 1) as latest_booking_id
      FROM clients c
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      query += ' AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    query += ' ORDER BY c.id DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. REVIEWS API
// ==========================================
app.get('/api/reviews', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM reviews ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', (req, res) => {
  try {
    const { booking_reference, guest_name, room_name, rating, comment } = req.body;
    if (!guest_name || !rating || !comment) {
      return res.status(400).json({ error: 'Guest name, rating, and comment are required' });
    }
    const stmt = db.prepare(`
      INSERT INTO reviews (booking_reference, guest_name, room_name, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(booking_reference || null, guest_name, room_name || 'Hytech Hotel & Bistro', rating, comment);
    const newReview = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. CALENDAR & OCCUPANCY API
// ==========================================
app.get('/api/calendar', (req, res) => {
  try {
    const { year, month } = req.query; // year e.g. 2026, month 1-12
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || (new Date().getMonth() + 1);

    const monthStr = m.toString().padStart(2, '0');
    const startStr = `${y}-${monthStr}-01`;
    // Find days in month
    const daysInMonth = new Date(y, m, 0).getDate();
    const endStr = `${y}-${monthStr}-${daysInMonth}`;

    // Get bookings that overlap with this month
    const bookings = db.prepare(`
      SELECT reference_id, guest_name, room_name, room_number, check_in, check_out, status
      FROM bookings
      WHERE status NOT IN ('Cancelled')
        AND check_in <= ?
        AND check_out >= ?
    `).all(endStr, startStr);

    // Calculate occupancy map for each day
    const daysData = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDateStr = `${y}-${monthStr}-${day.toString().padStart(2, '0')}`;
      // Rule: "Select a date to see guests staying that night. Check-out day is excluded."
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
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const totalBookings = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;
    const pendingBookings = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'Pending'").get().c;
    const confirmedBookings = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'Confirmed'").get().c;
    const checkedIn = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'Checked in'").get().c;
    const totalRevenue = db.prepare("SELECT SUM(total_amount) as s FROM bookings WHERE payment_status = 'Paid'").get().s || 0;
    
    // Key counts
    const keyTotal = db.prepare('SELECT COUNT(*) as c FROM keys').get().c;
    const keyAvailable = db.prepare("SELECT COUNT(*) as c FROM keys WHERE status = 'Available'").get().c;
    const keyAssigned = db.prepare("SELECT COUNT(*) as c FROM keys WHERE status = 'Assigned'").get().c;
    const keyLost = db.prepare("SELECT COUNT(*) as c FROM keys WHERE status = 'Lost / damaged'").get().c;

    // Food orders
    const foodOrdersTotal = db.prepare('SELECT COUNT(*) as c FROM food_orders').get().c;
    const foodOrdersPreparing = db.prepare("SELECT COUNT(*) as c FROM food_orders WHERE status = 'Preparing'").get().c;
    const foodRevenue = db.prepare("SELECT SUM(total_amount) as s FROM food_orders WHERE status IN ('Served', 'Completed')").get().s || 0;

    // Room stats
    const totalRooms = db.prepare('SELECT SUM(inventory) as s FROM rooms').get().s || 10;
    const occupiedNights = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status IN ('Confirmed', 'Checked in')").get().c;
    const occupancyRate = Math.min(100, Math.round((occupiedNights / Math.max(1, totalRooms)) * 100));

    // Recent activity
    const recentBookings = db.prepare('SELECT * FROM bookings ORDER BY id DESC LIMIT 5').all();

    res.json({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      checkedIn,
      totalRevenue,
      occupancyRate,
      keys: {
        total: keyTotal,
        available: keyAvailable,
        assigned: keyAssigned,
        lost: keyLost
      },
      food: {
        totalOrders: foodOrdersTotal,
        preparing: foodOrdersPreparing,
        revenue: foodRevenue
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
