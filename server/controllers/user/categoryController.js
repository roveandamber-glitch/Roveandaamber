import { CategoryModel } from '../../models/categoryModel.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.findAll();
    return res.json({
      success: true,
      data: categories.map(c => ({
        ...c,
        _id: String(c.id)
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const existing = await CategoryModel.findByName(name.trim());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    const category = await CategoryModel.create({
      name: name.trim(),
      image: imagePath
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: {
        ...category,
        _id: String(category.id)
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    let imagePath;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      imagePath = req.body.image;
    }

    const updated = await CategoryModel.update(id, {
      name: name.trim(),
      image: imagePath
    });

    return res.json({
      success: true,
      message: 'Category updated successfully.',
      data: {
        ...updated,
        _id: String(updated.id)
      }
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CategoryModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    return res.json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};
