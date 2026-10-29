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

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    return res.json({
      success: true,
      data: {
        ...category,
        _id: String(category.id)
      }
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch category.' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, status, image } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const existing = await CategoryModel.findByName(name.trim());
    if (existing) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists.' });
    }

    let imagePath = '';
    const uploadedFile = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
    if (uploadedFile) {
      imagePath = `/uploads/${uploadedFile.filename}`;
    } else if (image) {
      imagePath = image;
    }

    const isAct = !(status === 'Inactive' || status === false || status === 'false');

    const category = await CategoryModel.create({
      name: name.trim(),
      slug: slug ? slug.trim().toLowerCase() : undefined,
      description: description ? description.trim() : '',
      image: imagePath,
      status: isAct ? 'Active' : 'Inactive'
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
    const { name, slug, description, status, image } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    let imagePath;
    const uploadedFile = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
    if (uploadedFile) {
      imagePath = `/uploads/${uploadedFile.filename}`;
    } else if (image !== undefined) {
      imagePath = image;
    }

    const updatePayload = {
      name: name.trim(),
      slug: slug ? slug.trim().toLowerCase() : undefined,
      description: description !== undefined ? description : undefined,
    };
    if (status !== undefined) {
      const isAct = !(status === 'Inactive' || status === false || status === 'false');
      updatePayload.status = isAct ? 'Active' : 'Inactive';
    }
    if (imagePath !== undefined) {
      updatePayload.image = imagePath;
    }

    const updated = await CategoryModel.update(id, updatePayload);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

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

export const uploadCategoryImage = async (req, res) => {
  try {
    const uploadedFile = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
    if (!uploadedFile) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }
    const fileUrl = `/uploads/${uploadedFile.filename}`;
    return res.json({
      success: true,
      message: 'Image uploaded successfully.',
      imageUrl: fileUrl,
      url: fileUrl
    });
  } catch (error) {
    console.error('Upload category image error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload image.' });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const isAct = !(status === 'Inactive' || status === false || status === 'false');
    const updated = await CategoryModel.update(id, { status: isAct ? 'Active' : 'Inactive' });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.json({
      success: true,
      message: 'Category status updated.',
      data: {
        ...updated,
        _id: String(updated.id)
      }
    });
  } catch (error) {
    console.error('Toggle category status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update category status.' });
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
