// ============================================================
// Planify - server.js
// Full-stack backend: Node.js + Express + MySQL
// ============================================================

const express  = require('express');
const mysql    = require('mysql2/promise');
const session  = require('express-session');
const path     = require('path');

const app  = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'planify_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// ============================================================
// MySQL Database Connection
// Update host, user, password to match your MySQL setup
// ============================================================
const db = mysql.createPool({
  host:             'localhost',
  user:             'root',
  password:         '',          // <-- Change to your MySQL password
  database:         'planify_db',
  waitForConnections: true,
  connectionLimit:  10
});

async function initDB() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(100)  NOT NULL,
        email      VARCHAR(255)  UNIQUE NOT NULL,
        password   VARCHAR(255)  NOT NULL,
        created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT           NOT NULL,
        title      VARCHAR(255)  NOT NULL,
        priority   ENUM('high','medium','low') NOT NULL DEFAULT 'medium',
        completed  TINYINT(1)    DEFAULT 0,
        created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sticky_notes (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT       NOT NULL,
        text       TEXT      NOT NULL,
        color      VARCHAR(20) NOT NULL DEFAULT '#fef08a',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Database tables ready!');
  } catch (err) {
    console.error('DB Error:', err.message);
    console.error('Make sure MySQL is running and database "planify_db" exists.');
  }
}

function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  res.status(401).json({ error: 'Not logged in' });
}

// ============================================================
// AUTH ROUTES
// ============================================================

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
    req.session.user = rows[0];
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', requireLogin, (req, res) => {
  res.json(req.session.user);
});

// ============================================================
// TASKS API
// ============================================================

app.get('/api/tasks', requireLogin, async (req, res) => {
  const [rows] = await db.execute(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
    [req.session.user.id]
  );
  res.json(rows);
});

app.post('/api/tasks', requireLogin, async (req, res) => {
  const { title, priority } = req.body;
  const userId = req.session.user.id;
  const [result] = await db.execute(
    'INSERT INTO tasks (user_id, title, priority) VALUES (?, ?, ?)',
    [userId, title, priority]
  );
  res.json({ id: result.insertId, user_id: userId, title, priority, completed: 0 });
});

app.put('/api/tasks/:id', requireLogin, async (req, res) => {
  await db.execute(
    'UPDATE tasks SET completed = NOT completed WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.user.id]
  );
  res.json({ success: true });
});

app.delete('/api/tasks/:id', requireLogin, async (req, res) => {
  await db.execute(
    'DELETE FROM tasks WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.user.id]
  );
  res.json({ success: true });
});

// ============================================================
// STICKY NOTES API
// ============================================================

app.get('/api/notes', requireLogin, async (req, res) => {
  const [rows] = await db.execute(
    'SELECT * FROM sticky_notes WHERE user_id = ? ORDER BY created_at DESC',
    [req.session.user.id]
  );
  res.json(rows);
});

app.post('/api/notes', requireLogin, async (req, res) => {
  const { text, color } = req.body;
  const userId = req.session.user.id;
  const [result] = await db.execute(
    'INSERT INTO sticky_notes (user_id, text, color) VALUES (?, ?, ?)',
    [userId, text, color]
  );
  res.json({ id: result.insertId, text, color });
});

app.delete('/api/notes/:id', requireLogin, async (req, res) => {
  await db.execute(
    'DELETE FROM sticky_notes WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.user.id]
  );
  res.json({ success: true });
});

// ============================================================
// Serve HTML Pages
// ============================================================
app.get('/',          (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/upcoming',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'upcoming.html')));
app.get('/sticky',    (req, res) => res.sendFile(path.join(__dirname, 'public', 'sticky.html')));
app.get('/profile',   (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));

// ============================================================
// Start Server
// ============================================================
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\nPlanify is running!`);
    console.log(`  Open: http://localhost:${PORT}`);
  });
});
