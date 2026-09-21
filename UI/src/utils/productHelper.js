/**
 * Product Variant & Bundle Helper Utilities
 * Handles hierarchy: Master Product -> Variants (10 wala, 20 wala) -> Bundles/Sub-variants (Pack of 1, Pack of 10, Pack of 100)
 */

export const getDefaultVariant = (product) => {
  if (!product || !Array.isArray(product.variants) || product.variants.length === 0) {
    return null;
  }
  return product.variants.find((v) => v.isDefault) || product.variants[0];
};

export const getDefaultBundle = (variant) => {
  if (!variant || !Array.isArray(variant.bundles) || variant.bundles.length === 0) {
    return null;
  }
  return variant.bundles.find((b) => b.isDefault) || variant.bundles[0];
};

/**
 * Returns default rate, MRP, variant label, and bundle label for product card display.
 */
export const getDefaultProductPricing = (product) => {
  if (!product) {
    return {
      price: 0,
      mrp: 0,
      variantLabel: '',
      bundleLabel: '',
      image: '',
    };
  }

  const defaultVariant = getDefaultVariant(product);

  if (defaultVariant) {
    const defaultBundle = getDefaultBundle(defaultVariant);

    if (defaultBundle) {
      return {
        price: defaultBundle.price,
        mrp: defaultBundle.mrp || defaultBundle.price,
        variantLabel: defaultVariant.label,
        bundleLabel: defaultBundle.label,
        bundleQuantity: defaultBundle.quantity || 1,
        image: defaultBundle.image || (defaultVariant.variantImages && defaultVariant.variantImages[0]) || product.image,
        variant: defaultVariant,
        bundle: defaultBundle,
      };
    }

    return {
      price: defaultVariant.basePrice || product.price || 0,
      mrp: defaultVariant.baseMrp || product.mrp || product.price || 0,
      variantLabel: defaultVariant.label,
      bundleLabel: '',
      image: (defaultVariant.variantImages && defaultVariant.variantImages[0]) || product.image,
      variant: defaultVariant,
      bundle: null,
    };
  }

  return {
    price: product.price || 0,
    mrp: product.mrp || product.price || 0,
    variantLabel: product.subtitle || '',
    bundleLabel: '',
    image: product.image || '',
    variant: null,
    bundle: null,
  };
};
