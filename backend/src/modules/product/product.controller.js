const { Op } = require('sequelize');
const { Product, ProductBundle, Category } = require('../../models');
const { uploadBase64 } = require('../../services/s3.service');

function formatProductResponse(prod) {
  const json = prod.toJSON ? prod.toJSON() : prod;
  const bundlesList = (json.bundles || []).map((b) => ({
    _id: String(b.id || b.bundleId),
    bundleId: b.bundleId || `BNDL-${b.id}`,
    label: b.label,
    quantity: Number(b.quantity || 1),
    price: Number(b.price || json.price || 0),
    mrp: Number(b.mrp || json.mrp || b.price || json.price || 0),
    stockQuantity: Number(b.stockQuantity || 100),
    isDefault: Boolean(b.isDefault),
  }));

  const defaultBundle = bundlesList.find((b) => b.isDefault) || bundlesList[0] || {
    bundleId: `b-${json.id}-1`,
    label: 'Pack of 1',
    quantity: 1,
    price: Number(json.price || 0),
    mrp: Number(json.mrp || json.price || 0),
    isDefault: true,
  };

  return {
    _id: String(json.id),
    id: json.id,
    masterProductId: json.id,
    variantId: 'default',
    name: json.name || '',
    rawProductName: json.name,
    variantLabel: json.subtitle || 'Standard',
    subtitle: json.subtitle || 'Standard',
    description: json.description || '',
    brand: json.brand || 'RS Pro',
    category: json.categoryName || json.category?.name || 'General',
    categorySlug: json.categorySlug || json.category?.slug || '',
    categoryRef: json.categoryId,
    price: defaultBundle.price || Number(json.price || 0),
    mrp: defaultBundle.mrp || Number(json.mrp || json.price || 0),
    badge: json.badge || 'Wholesale',
    image: json.image || '',
    baseImages: Array.isArray(json.baseImages) ? json.baseImages : [],
    stockQuantity: Number(json.stockQuantity || 100),
    bundles: bundlesList.length > 0 ? bundlesList : [defaultBundle],
    defaultBundle,
    isActive: json.isActive !== false,
    isFeatured: Boolean(json.isFeatured),
    displayOrder: Number(json.displayOrder || 1),
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = {};

    // Search filter
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { name: { [Op.like]: term } },
        { subtitle: { [Op.like]: term } },
        { brand: { [Op.like]: term } },
      ];
    }

    // Category filter
    if (category && category.trim().toUpperCase() !== 'ALL') {
      const catTrim = category.trim();
      const numId = Number(catTrim);
      if (!isNaN(numId) && numId > 0) {
        where[Op.or] = [
          ...(where[Op.or] || []),
          { categoryId: numId },
        ];
      } else {
        where[Op.or] = [
          ...(where[Op.or] || []),
          { categoryName: { [Op.like]: `%${catTrim}%` } },
          { categorySlug: { [Op.like]: `%${catTrim.toLowerCase()}%` } },
        ];
      }
    }

    const products = await Product.findAll({
      where,
      include: [
        { model: ProductBundle, as: 'bundles' },
        { model: Category, as: 'category' },
      ],
      order: [['displayOrder', 'ASC'], ['id', 'DESC']],
    });

    return res.json(products.map(formatProductResponse));
  } catch (err) {
    console.error('[ProductController] DB product query error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = req.body;
    let categoryId = data.categoryId || null;
    let categoryName = data.categoryName || '';
    let categorySlug = data.categorySlug || '';

    // Handle category name or object
    if (data.category) {
      if (typeof data.category === 'string') {
        categoryName = data.category.trim();
        categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cat = await Category.findOne({
          where: {
            [Op.or]: [{ name: categoryName }, { slug: categorySlug }],
          },
        });
        if (cat) {
          categoryId = cat.id;
          categoryName = cat.name;
          categorySlug = cat.slug;
        }
      } else if (typeof data.category === 'object') {
        categoryId = data.category.id || data.category._id || categoryId;
        categoryName = data.category.name || categoryName;
        categorySlug = data.category.slug || categorySlug;
      }
    }

    let primaryImage = (data.image || '').trim();
    if (primaryImage.startsWith('data:')) {
      primaryImage = await uploadBase64(primaryImage, 'products');
    }

    let galleryImages = Array.isArray(data.baseImages) ? data.baseImages : [];
    if (galleryImages.length > 0) {
      galleryImages = await Promise.all(
        galleryImages.map((img) => (typeof img === 'string' && img.startsWith('data:') ? uploadBase64(img, 'products') : img))
      );
    }

    const product = await Product.create({
      name: (data.name || '').trim(),
      slug: (data.slug || (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim(),
      subtitle: (data.subtitle || '').trim(),
      description: (data.description || '').trim(),
      brand: (data.brand || 'RS Pro').trim(),
      categoryId,
      categoryName,
      categorySlug,
      price: Number(data.price || 0),
      mrp: Number(data.mrp || data.price || 0),
      badge: (data.badge || 'Wholesale').trim(),
      image: primaryImage,
      baseImages: galleryImages,
      stockQuantity: Number(data.stockQuantity || 100),
      displayOrder: Number(data.displayOrder || 1),
      isActive: data.isActive !== false,
      isFeatured: Boolean(data.isFeatured),
    });

    // Create bundles if provided
    if (Array.isArray(data.bundles) && data.bundles.length > 0) {
      const bundleRecords = data.bundles.map((b, i) => ({
        productId: product.id,
        bundleId: b.bundleId || `BNDL-${i + 1}`,
        label: b.label || `Pack of ${b.quantity || 1}`,
        quantity: Number(b.quantity || 1),
        price: Number(b.price || product.price),
        mrp: Number(b.mrp || b.price || product.price),
        stockQuantity: Number(b.stockQuantity || 100),
        isDefault: Boolean(b.isDefault || i === 0),
      }));
      await ProductBundle.bulkCreate(bundleRecords);
    }

    const created = await Product.findByPk(product.id, {
      include: [{ model: ProductBundle, as: 'bundles' }],
    });

    return res.status(201).json(formatProductResponse(created));
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const data = req.body;
    const updateFields = {};
    if (data.name !== undefined) updateFields.name = data.name.trim();
    if (data.subtitle !== undefined) updateFields.subtitle = data.subtitle.trim();
    if (data.description !== undefined) updateFields.description = data.description.trim();
    if (data.brand !== undefined) updateFields.brand = data.brand.trim();
    if (data.badge !== undefined) updateFields.badge = data.badge.trim();
    if (data.price !== undefined) updateFields.price = Number(data.price);
    if (data.mrp !== undefined) updateFields.mrp = Number(data.mrp);
    if (data.stockQuantity !== undefined) updateFields.stockQuantity = Number(data.stockQuantity);
    if (data.displayOrder !== undefined) updateFields.displayOrder = Number(data.displayOrder);
    if (data.isActive !== undefined) updateFields.isActive = Boolean(data.isActive);
    if (data.isFeatured !== undefined) updateFields.isFeatured = Boolean(data.isFeatured);
    if (data.image !== undefined) {
      let img = (data.image || '').trim();
      if (img.startsWith('data:')) {
        img = await uploadBase64(img, 'products');
      }
      updateFields.image = img;
    }
    if (data.baseImages !== undefined && Array.isArray(data.baseImages)) {
      updateFields.baseImages = await Promise.all(
        data.baseImages.map((img) => (typeof img === 'string' && img.startsWith('data:') ? uploadBase64(img, 'products') : img))
      );
    }

    if (data.category) {
      if (typeof data.category === 'string') {
        const cat = await Category.findOne({
          where: { [Op.or]: [{ name: data.category.trim() }, { slug: data.category.trim().toLowerCase() }] },
        });
        if (cat) {
          updateFields.categoryId = cat.id;
          updateFields.categoryName = cat.name;
          updateFields.categorySlug = cat.slug;
        } else {
          updateFields.categoryName = data.category.trim();
        }
      }
    }

    await product.update(updateFields);

    // Update bundles if provided
    if (Array.isArray(data.bundles)) {
      await ProductBundle.destroy({ where: { productId: product.id } });
      if (data.bundles.length > 0) {
        const bundleRecords = data.bundles.map((b, i) => {
          const isSingleUnit = Number(b.quantity || 1) === 1;
          const isDef = Boolean(b.isDefault || i === 0);
          const currentPrice = updateFields.price !== undefined ? updateFields.price : Number(product.price);
          const currentMrp = updateFields.mrp !== undefined ? updateFields.mrp : Number(product.mrp || product.price);
          const bPrice = (isSingleUnit || isDef) ? currentPrice : Number(b.price || currentPrice);
          const bMrp = (isSingleUnit || isDef) ? currentMrp : Number(b.mrp || b.price || currentPrice);

          return {
            productId: product.id,
            bundleId: b.bundleId || `BNDL-${i + 1}`,
            label: b.label || (isSingleUnit ? 'Pack of 1' : `Pack of ${b.quantity || 1}`),
            quantity: Number(b.quantity || 1),
            price: bPrice,
            mrp: bMrp,
            stockQuantity: Number(b.stockQuantity || 100),
            isDefault: isDef,
          };
        });
        await ProductBundle.bulkCreate(bundleRecords);
      }
    } else if (updateFields.price !== undefined || updateFields.mrp !== undefined) {
      // Sync existing default/single-unit bundles if price changed without bundles payload
      const singleBundle = await ProductBundle.findOne({
        where: {
          productId: product.id,
          [Op.or]: [{ quantity: 1 }, { isDefault: true }],
        },
      });
      if (singleBundle) {
        const bundleUpdates = {};
        if (updateFields.price !== undefined) bundleUpdates.price = updateFields.price;
        if (updateFields.mrp !== undefined) bundleUpdates.mrp = updateFields.mrp;
        await singleBundle.update(bundleUpdates);
      }
    }

    const updated = await Product.findByPk(product.id, {
      include: [{ model: ProductBundle, as: 'bundles' }],
    });

    return res.json(formatProductResponse(updated));
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.destroy();
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to delete product' });
  }
};
