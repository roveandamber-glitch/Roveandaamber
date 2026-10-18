import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../database.sqlite');

const rawDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  }
});

// Enable Foreign Keys in SQLite
rawDb.run('PRAGMA foreign_keys = ON');

// Promisified DB helpers for clean async/await code
export const db = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
};

// Safely add column if it doesn't already exist
const addColumnIfNotExists = async (table, columnDef) => {
  try {
    await db.run(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
  } catch (err) {
    // Column already exists or duplicate, safe to ignore in SQLite
  }
};

// Initialize schema tables
export const initDB = async () => {
  try {
    // 1. Users Table
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        phone TEXT,
        address TEXT
      )
    `);
    await addColumnIfNotExists('users', 'phone TEXT');
    await addColumnIfNotExists('users', 'address TEXT');

    // 2. Categories Table
    await db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        image TEXT
      )
    `);
    await addColumnIfNotExists('categories', 'image TEXT');

    // 3. Products Table
    await db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image TEXT,
        category_id INTEGER,
        sizes TEXT,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);
    await addColumnIfNotExists('products', 'sizes TEXT');

    // 4. Orders Table
    await db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        customer_name TEXT,
        phone TEXT,
        address TEXT,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'placed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    await addColumnIfNotExists('orders', 'customer_name TEXT');
    await addColumnIfNotExists('orders', 'phone TEXT');
    await addColumnIfNotExists('orders', 'address TEXT');

    // 5. Order Items Table
    await db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        size TEXT DEFAULT 'M',
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    await addColumnIfNotExists('order_items', 'size TEXT');

    // Seed or update default admin account
    await db.run(`UPDATE users SET email = 'admin@zyra.com' WHERE email = 'admin@enva.com'`);
    const existingAdmin = await db.get(`SELECT * FROM users WHERE email = ?`, ['admin@zyra.com']);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.run(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ['Admin User', 'admin@zyra.com', hashedPassword, 'admin']
      );
    }

    // Seed default customer account if not exists
    const existingCustomer = await db.get(`SELECT * FROM users WHERE email = ?`, ['aisha@example.com']);
    if (!existingCustomer) {
      const customerPassword = await bcrypt.hash('user123', 10);
      await db.run(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ['Aisha Sharma', 'aisha@example.com', customerPassword, 'user']
      );
    }

    // Seed default categories if empty
    const categoryCount = await db.get(`SELECT COUNT(*) as count FROM categories`);
    if (categoryCount.count === 0) {
      const defaultCategories = [
        { name: 'Ethnic Wear', image: '/Images/ethinic.png' },
        { name: 'Western Wear', image: '/Images/western.png' },
        { name: 'Casual Wear', image: '/Images/casual.png' },
        { name: 'Party Wear', image: '/Images/party.png' }
      ];
      for (const cat of defaultCategories) {
        await db.run(`INSERT INTO categories (name, image) VALUES (?, ?)`, [cat.name, cat.image]);
      }
    } else {
      // Ensure existing default categories have images if null
      await db.run(`UPDATE categories SET image = '/Images/ethinic.png' WHERE name = 'Ethnic Wear' AND (image IS NULL OR image = '')`);
      await db.run(`UPDATE categories SET image = '/Images/western.png' WHERE name = 'Western Wear' AND (image IS NULL OR image = '')`);
      await db.run(`UPDATE categories SET image = '/Images/casual.png' WHERE name = 'Casual Wear' AND (image IS NULL OR image = '')`);
      await db.run(`UPDATE categories SET image = '/Images/party.png' WHERE name = 'Party Wear' AND (image IS NULL OR image = '')`);
    }

    // Seed initial products if empty
    const productCount = await db.get(`SELECT COUNT(*) as count FROM products`);
    if (productCount.count === 0) {
      const initialProducts = [
        { name: 'Tailored Trench Coat', price: 4499, stock: 15, image: '/Images/brown.png', category_id: 2 },
        { name: 'Western Blue Flare Dress', price: 2999, stock: 20, image: '/Images/blueWestern.png', category_id: 2 },
        { name: 'Embroidered Ethnic Kurti Set', price: 2499, stock: 18, image: '/Images/kurthi.png', category_id: 1 },
        { name: 'Classic Striped Linen Shirt', price: 1899, stock: 25, image: '/Images/casual.png', category_id: 3 },
        { name: 'Designer Party Wear Gown', price: 3999, stock: 10, image: '/Images/party.png', category_id: 4 },
        { name: 'Emerald Green Silk Top', price: 1499, stock: 12, image: '/Images/greenTop.png', category_id: 2 },
        { name: 'Classic Noir Evening Dress', price: 3499, stock: 14, image: '/Images/black.png', category_id: 2 },
        { name: 'Bohemian Western Maxi Dress', price: 2799, stock: 8, image: '/Images/western.png', category_id: 2 }
      ];

      for (const p of initialProducts) {
        await db.run(
          `INSERT INTO products (name, price, stock, image, category_id) VALUES (?, ?, ?, ?, ?)`,
          [p.name, p.price, p.stock, p.image, p.category_id]
        );
      }
    }
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

export default db;
