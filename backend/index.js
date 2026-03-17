const express = require('express');
const mysql = require('mysql2/promise');
const redis = require('redis');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Secret key for signing JWTs — in production, load from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'freshshop_secret_key_2025';

app.use(cors());
app.use(express.json());

// ── MySQL connection pool ─────────────────────────────────────────
const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'app',
    password: process.env.DB_PASSWORD || 'gVdYVZxC0SWk',
    database: process.env.DB_NAME || 'grocer',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ── Redis client ──────────────────────────────────────────────────
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});
redisClient.on('error', (err) => console.log('Redis Client Error:', err));
redisClient.connect().catch(console.error);

// ════════════════════════════════════════════════════════════════
//  JWT MIDDLEWARE — verifies the token on protected routes
// ════════════════════════════════════════════════════════════════
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, name, email }
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// ════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════════════════════════

// POST /api/auth/register — create a new user
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Basic input validation
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    try {
        // Check if email already exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'An account with that email already exists.' });
        }

        // Hash the password (10 salt rounds is the standard)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        // Sign a JWT for the new user
        const token = jwt.sign(
            { id: result.insertId, name, email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ token, user: { id: result.insertId, name, email } });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

// POST /api/auth/login — authenticate an existing user
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        // Find the user by email
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = rows[0];

        // Compare the provided password with the stored hash
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Sign and return a JWT
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed.' });
    }
});

// ════════════════════════════════════════════════════════════════
//  PRODUCT ROUTES (public — no auth needed)
// ════════════════════════════════════════════════════════════════

// GET /api/items — fetch all categories with their items
app.get('/api/items', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM category');
        const [items] = await db.query('SELECT * FROM items');

        const result = categories.map(cat => ({
            ...cat,
            items: items.filter(item => item.category_id === cat.id)
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Failed to fetch items.' });
    }
});

// ════════════════════════════════════════════════════════════════
//  CART ROUTES (protected — requires valid JWT)
// ════════════════════════════════════════════════════════════════

// GET /api/cart — get the cart for the authenticated user
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const cart = await redisClient.get(`cart:${req.user.id}`);
        res.json(cart ? JSON.parse(cart) : []);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to fetch cart.' });
    }
});

// POST /api/cart — save the cart for the authenticated user
app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
        await redisClient.set(`cart:${req.user.id}`, JSON.stringify(req.body));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving cart:', error);
        res.status(500).json({ error: 'Failed to save cart.' });
    }
});

// ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
