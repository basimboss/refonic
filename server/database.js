const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

let db;
let pool;

if (isProduction && connectionString) {
    // PostgreSQL (Production)
    pool = new Pool({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });
    console.log("Connected to PostgreSQL.");
} else {
    // SQLite (Local)
    const dbPath = path.resolve(__dirname, 'refonic.db');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error('Error opening database ' + dbPath + ': ' + err.message);
        else console.log('Connected to the SQLite database.');
    });
}

// Helper to convert ? to $1, $2 for Postgres
const convertSql = (sql) => {
    if (!pool) return sql; // SQLite uses ?
    let i = 1;
    return sql.replace(/\?/g, () => `$${i++}`);
};

const database = {
    query: async (sql, params = []) => {
        if (pool) {
            const res = await pool.query(convertSql(sql), params);
            return { rows: res.rows, rowCount: res.rowCount, lastID: res.rows[0]?.id }; // PG doesn't return lastID easily unless RETURNING id
        } else {
            return new Promise((resolve, reject) => {
                // Determine if it's a SELECT or modification
                if (sql.trim().toUpperCase().startsWith('SELECT')) {
                    db.all(sql, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve({ rows, rowCount: rows.length });
                    });
                } else {
                    db.run(sql, params, function (err) {
                        if (err) reject(err);
                        else resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
                    });
                }
            });
        }
    },

    // Initialize Schema
    init: async () => {
        const usersTable = pool
            ? `CREATE TABLE IF NOT EXISTS users (
                 id SERIAL PRIMARY KEY,
                 password_hash TEXT NOT NULL
               )`
            : `CREATE TABLE IF NOT EXISTS users (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 password_hash TEXT NOT NULL
               )`;

        const productsTable = pool
            ? `CREATE TABLE IF NOT EXISTS products (
                 id SERIAL PRIMARY KEY,
                 name TEXT NOT NULL,
                 im_code TEXT,
                 status TEXT NOT NULL,
                 date TEXT,
                 sale_price REAL,
                 sale_date TEXT,
                 service_date TEXT,
                 barcode TEXT
               )`
            : `CREATE TABLE IF NOT EXISTS products (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 name TEXT NOT NULL,
                 im_code TEXT,
                 status TEXT NOT NULL,
                 date TEXT,
                 sale_price REAL,
                 sale_date TEXT,
                 service_date TEXT,
                 barcode TEXT
               )`;

        try {
            await database.query(usersTable);
            await database.query(productsTable);

            // Check for default user
            const res = await database.query("SELECT count(*) as count FROM users");
            const count = pool ? parseInt(res.rows[0].count) : res.rows[0].count;

            if (count === 0) {
                const defaultPassword = 'admin'; // Default, user changed it locally but cloud will be new
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(defaultPassword, salt);
                await database.query("INSERT INTO users (password_hash) VALUES (?)", [hash]);
                console.log("Default user created (password: admin)");
            }
        } catch (err) {
            console.error("Schema initialization error:", err);
        }

        // Phase 2: Add new columns if they don't exist (Migration)
        const migrationQueries = [
            "ALTER TABLE products ADD COLUMN storage TEXT",
            "ALTER TABLE products ADD COLUMN ram TEXT",
            "ALTER TABLE products ADD COLUMN sponsor_name TEXT",
            // Phase 3: Sales Details
            "ALTER TABLE products ADD COLUMN buyer_name TEXT",
            "ALTER TABLE products ADD COLUMN exchange_details TEXT"
        ];

        for (const query of migrationQueries) {
            try {
                // Postgres supports IF NOT EXISTS in ALTER TABLE, but SQLite doesn't always.
                // Simplest way: Try to add, ignore error if column exists.
                if (pool) {
                    await database.query(query.replace("ADD COLUMN", "ADD COLUMN IF NOT EXISTS"));
                } else {
                    await database.query(query);
                }
            } catch (err) {
                // Ignore "duplicate column" errors
                if (!err.message.includes("duplicate column") && !err.message.includes("no such column")) {
                    console.log(`Migration note: ${err.message}`);
                }
            }
        }
    }
};

// Initialize on load
database.init();

module.exports = database;
