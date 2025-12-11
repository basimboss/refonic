const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.path}`);
    next();
});

// --- Authentication ---

// Login
app.post('/api/auth/login', async (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    try {
        const result = await db.query("SELECT * FROM users LIMIT 1");
        const user = result.rows[0];

        if (!user) return res.status(401).json({ error: 'No user found' });

        const isValid = bcrypt.compareSync(password, user.password_hash);
        if (isValid) {
            res.json({ message: 'Login successful', token: 'dummy-token' });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ error: err.message });
    }
});

// Change Password
app.post('/api/auth/change-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });

    try {
        const result = await db.query("SELECT * FROM users LIMIT 1");
        const user = result.rows[0];

        if (!user) return res.status(401).json({ error: 'User not found' });

        const isValid = bcrypt.compareSync(oldPassword, user.password_hash);
        if (isValid) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(newPassword, salt);
            await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, user.id]);
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ error: 'Incorrect old password' });
        }
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- Products ---

// Get All Products (with optional search)
// Get All Products (with optional search)
app.get('/api/products', async (req, res) => {
    const { search, status } = req.query;
    let query = "SELECT * FROM products";
    let params = [];
    let conditions = [];

    if (status && status !== 'All') {
        conditions.push("status = ?");
        params.push(status);
    }

    if (search) {
        conditions.push("(name LIKE ? OR im_code LIKE ? OR barcode LIKE ? OR sponsor_name LIKE ?)");
        const likeTerm = `%${search}%`;
        params.push(likeTerm, likeTerm, likeTerm, likeTerm);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY id DESC";

    try {
        const result = await db.query(query, params);
        res.json({ data: result.rows });
    } catch (err) {
        console.error("Error getting products:", err);
        res.status(500).json({ error: err.message });
    }
});

// Add Product
app.post('/api/products', async (req, res) => {
    const { name, im_code, status, date, sale_price, sale_date, service_date, barcode, storage, ram, sponsor_name } = req.body;

    let sql = `INSERT INTO products (name, im_code, status, date, sale_price, sale_date, service_date, barcode, storage, ram, sponsor_name) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
    if (process.env.DATABASE_URL) sql += " RETURNING id";

    const safeSalePrice = sale_price === '' ? null : sale_price;
    const params = [name, im_code, status, date, safeSalePrice, sale_date, service_date, barcode, storage, ram, sponsor_name];

    try {
        const result = await db.query(sql, params);
        const newId = result.lastID || (result.rows[0] ? result.rows[0].id : null);
        res.json({ message: 'Product added', id: newId });
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ error: err.message });
    }
});

// Update Product
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, im_code, status, date, sale_price, sale_date, service_date, barcode, storage, ram, sponsor_name } = req.body;

    const sql = `UPDATE products SET name = ?, im_code = ?, status = ?, date = ?, sale_price = ?, sale_date = ?, service_date = ?, barcode = ?, storage = ?, ram = ?, sponsor_name = ? WHERE id = ?`;

    const safeSalePrice = sale_price === '' ? null : sale_price;
    const params = [name, im_code, status, date, safeSalePrice, sale_date, service_date, barcode, storage, ram, sponsor_name, id];

    try {
        await db.query(sql, params);
        res.json({ message: 'Product updated' });
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ error: err.message });
    }
});

// Scan Barcode (Find Product)
app.get('/api/products/scan/:barcode', async (req, res) => {
    const { barcode } = req.params;
    try {
        const result = await db.query("SELECT * FROM products WHERE barcode = ?", [barcode]);
        const row = result.rows[0];
        if (!row) return res.status(404).json({ message: 'Product not found' });
        res.json({ data: row });
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- Serve Static Assets in Production ---
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
