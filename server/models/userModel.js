import { db } from '../config/db.js';

export const UserModel = {
  findByEmail: async (email) => {
    return await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
  },

  findById: async (id) => {
    return await db.get(`SELECT id, name, email, role, phone, address FROM users WHERE id = ?`, [id]);
  },

  findWithPasswordById: async (id) => {
    return await db.get(`SELECT id, name, email, password, role, phone, address FROM users WHERE id = ?`, [id]);
  },

  findAll: async () => {
    return await db.all(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.phone,
        u.address,
        COUNT(o.id) AS orders_count,
        COALESCE(SUM(o.total_amount), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role != 'admin'
      GROUP BY u.id
      ORDER BY u.id ASC
    `);
  },

  create: async ({ name, email, password, role = 'user', phone = null, address = null }) => {
    const result = await db.run(
      `INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password, role, phone, address]
    );
    return { id: result.lastID, name, email, role, phone, address };
  },

  updateProfile: async (id, { name, phone, address }) => {
    await db.run(
      `UPDATE users SET name = COALESCE(?, name), phone = ?, address = ? WHERE id = ?`,
      [name, phone, address, id]
    );
    return await db.get(`SELECT id, name, email, role, phone, address FROM users WHERE id = ?`, [id]);
  },

  updatePassword: async (id, hashedPassword) => {
    await db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id]);
    return true;
  }
};

export default UserModel;
