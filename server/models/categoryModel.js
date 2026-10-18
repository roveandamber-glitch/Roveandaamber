import { db } from '../config/db.js';

export const CategoryModel = {
  findAll: async () => {
    return await db.all(`SELECT * FROM categories ORDER BY id ASC`);
  },

  findById: async (id) => {
    return await db.get(`SELECT * FROM categories WHERE id = ?`, [id]);
  },

  findByName: async (name) => {
    return await db.get(`SELECT * FROM categories WHERE name = ?`, [name]);
  },

  create: async ({ name, image = '' }) => {
    const result = await db.run(
      `INSERT INTO categories (name, image) VALUES (?, ?)`,
      [name, image]
    );
    return { id: result.lastID, name, image };
  },

  update: async (id, { name, image }) => {
    const existing = await db.get(`SELECT image FROM categories WHERE id = ?`, [id]);
    const finalImage = image !== undefined ? image : (existing ? existing.image : '');

    await db.run(
      `UPDATE categories SET name = ?, image = ? WHERE id = ?`,
      [name, finalImage, id]
    );
    return { id, name, image: finalImage };
  },

  delete: async (id) => {
    const result = await db.run(`DELETE FROM categories WHERE id = ?`, [id]);
    return result.changes > 0;
  }
};

export default CategoryModel;
