import { db } from '../config/db.js';

export const ProductModel = {
  findAll: async ({ categoryId, search } = {}) => {
    let sql = `
      SELECT p.*, c.name AS category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (categoryId) {
      sql += ` AND (p.category_id = ? OR c.name LIKE ?)`;
      params.push(categoryId, `%${categoryId}%`);
    }

    if (search) {
      sql += ` AND (p.name LIKE ? OR c.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY p.id DESC`;
    return await db.all(sql, params);
  },

  findById: async (id) => {
    return await db.get(`
      SELECT p.*, c.name AS category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
  },

  create: async ({ name, price, stock = 0, image = '', category_id, sizes = '' }) => {
    const finalSizes = typeof sizes === 'object' ? JSON.stringify(sizes) : (sizes || '');
    const result = await db.run(
      `INSERT INTO products (name, price, stock, image, category_id, sizes) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, price, stock, image, category_id, finalSizes]
    );
    return { id: result.lastID, name, price, stock, image, category_id, sizes: finalSizes };
  },

  update: async (id, { name, price, stock, image, category_id, sizes }) => {
    const existing = await db.get(`SELECT * FROM products WHERE id = ?`, [id]);
    const finalImage = image !== undefined ? image : (existing ? existing.image : '');
    const finalSizes = sizes !== undefined 
      ? (typeof sizes === 'object' ? JSON.stringify(sizes) : sizes) 
      : (existing ? existing.sizes : '');

    await db.run(`
      UPDATE products 
      SET name = ?, price = ?, stock = ?, image = ?, category_id = ?, sizes = ?
      WHERE id = ?
    `, [name, price, stock, finalImage, category_id, finalSizes, id]);

    return { id, name, price, stock, image: finalImage, category_id, sizes: finalSizes };
  },

  delete: async (id) => {
    const result = await db.run(`DELETE FROM products WHERE id = ?`, [id]);
    return result.changes > 0;
  },

  decrementStock: async (id, size, quantity) => {
    const product = await db.get(`SELECT * FROM products WHERE id = ?`, [id]);
    if (!product) return null;

    let sizesMap = {};
    if (product.sizes) {
      try {
        sizesMap = JSON.parse(product.sizes);
      } catch (e) {}
    }

    if (!sizesMap || Object.keys(sizesMap).length === 0) {
      const defQty = Math.max(1, Math.floor((product.stock || 12) / 4));
      sizesMap = { 'S': defQty, 'M': defQty, 'L': defQty, 'XL': defQty };
    }

    const normalizedSize = (size || 'M').toUpperCase();
    if (sizesMap[normalizedSize] !== undefined) {
      sizesMap[normalizedSize] = Math.max(0, sizesMap[normalizedSize] - quantity);
    } else {
      sizesMap[normalizedSize] = 0;
    }

    const updatedSizes = JSON.stringify(sizesMap);

    await db.run(
      `UPDATE products SET stock = MAX(0, stock - ?), sizes = ? WHERE id = ?`,
      [quantity, updatedSizes, id]
    );
  }
};

export default ProductModel;
