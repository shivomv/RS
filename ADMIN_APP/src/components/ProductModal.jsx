import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProductModal({
  visible,
  onClose,
  product = null,
  categories = [],
  onSave,
}) {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Floor Cleaners');
  const [brand, setBrand] = useState('RS Pro');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [badge, setBadge] = useState('Factory Direct');
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSubtitle(product.subtitle || '');
      setCategory(product.category?.name || product.category || 'Floor Cleaners');
      setBrand(product.brand || 'RS Pro');
      setPrice(String(product.price || ''));
      setMrp(String(product.mrp || product.price || ''));
      setStockQuantity(String(product.stockQuantity || '100'));
      setBadge(product.badge || 'Factory Direct');
      setImage(product.image || '');
    } else {
      setName('');
      setSubtitle('500ml Bottle');
      setCategory(categories[0]?.name || 'Floor Cleaners');
      setBrand('RS Pro');
      setPrice('');
      setMrp('');
      setStockQuantity('100');
      setBadge('Factory Direct');
      setImage('');
    }
  }, [product, visible, categories]);

  const handleSubmit = async () => {
    if (!name.trim() || !price) {
      alert('Product Name and Price are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        subtitle: subtitle.trim(),
        category,
        brand,
        price: Number(price),
        mrp: Number(mrp || price),
        stockQuantity: Number(stockQuantity || 100),
        badge,
        image: image.trim(),
      };

      await onSave(payload, product?._id);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 justify-center items-center p-4">
        <View className="bg-[#131b2e] rounded-3xl w-full max-w-lg border border-[#232d46] shadow-2xl overflow-hidden max-h-[90%]">
          {/* Modal Header */}
          <View className="bg-[#1c263d] px-5 py-4 flex-row items-center justify-between border-b border-[#232d46]">
            <View className="flex-row items-center gap-2">
              <Icon name={product ? 'edit' : 'add-circle-outline'} size={22} color="#006948" />
              <Text className="text-base font-black text-white">
                {product ? 'Edit Product SKU' : 'Create New Product SKU'}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-[#2d3a58] justify-center items-center active:opacity-70"
            >
              <Icon name="close" size={18} color="#ffffff" />
            </Pressable>
          </View>

          {/* Form Scroll Area */}
          <ScrollView className="p-5">
            {/* Product Name */}
            <View className="mb-4">
              <Text className="text-[11px] font-bold text-[#8c9ba5] mb-1 uppercase tracking-wider">
                Product Name *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Ultra-Clean Floor Cleaner"
                placeholderTextColor="#5b6a82"
                className="bg-[#1c263d] rounded-2xl px-4 py-3 text-sm font-bold text-white border border-[#2d3a58]"
              />
            </View>

            {/* Subtitle / Packaging */}
            <View className="mb-4">
              <Text className="text-[11px] font-bold text-[#8c9ba5] mb-1 uppercase tracking-wider">
                Subtitle / Size Packaging
              </Text>
              <TextInput
                value={subtitle}
                onChangeText={setSubtitle}
                placeholder="e.g. 500ml Bottle or 5L Drum"
                placeholderTextColor="#5b6a82"
                className="bg-[#1c263d] rounded-2xl px-4 py-3 text-sm font-bold text-white border border-[#2d3a58]"
              />
            </View>

            {/* Category & Brand row */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-[11px] font-bold text-[#8c9ba5] mb-1 uppercase tracking-wider">
                  Category
                </Text>
                <TextInput
                  value={category}
                  onChangeText={setCategory}
                  placeholder="Category Name"
                  placeholderTextColor="#5b6a82"
                  className="bg-[#1c263d] rounded-2xl px-3.5 py-3 text-xs font-bold text-white border border-[#2d3a58]"
                />
              </View>

              <View className="flex-1">
                <Text className="text-[11px] font-bold text-[#8c9ba5] mb-1 uppercase tracking-wider">
                  Brand
                </Text>
                <TextInput
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="Brand Name"
                  placeholderTextColor="#5b6a82"
                  className="bg-[#1c263d] rounded-2xl px-3.5 py-3 text-xs font-bold text-white border border-[#2d3a58]"
                />
              </View>
            </View>

            {/* Pricing Row: Price & MRP */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-[11px] font-bold text-[#8c9ba5] mb-1 uppercase tracking-wider">
                  Wholesale Price (₹) *
                </Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="e.g. 99"
                  placeholderTextColor="#5b6a82"
                  keyboardType="numeric"
                  className="bg-[#1c263d] rounded-2xl px-3.5 py-3 text-sm font-extrabold text-[#10b981] border border-[#2d3a58]"
                />
              </View>

              <View className="flex-1">
                <Text className="text-[11px] font-bold text-[#8c9ba5] mb-1 uppercase tracking-wider">
                  Retail MRP (₹)
                </Text>
                <TextInput
                  value={mrp}
                  onChangeText={setMrp}
                  placeholder="e.g. 150"
                  placeholderTextColor="#5b6a82"
                  keyboardType="numeric"
                  className="bg-[#1c263d] rounded-2xl px-3.5 py-3 text-sm font-extrabold text-[#8c9ba5] border border-[#2d3a58]"
                />
              </View>
            </View>

            {/* Stock Quantity & Badge */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-[11px] font-bold text-[#8c9ba5] mb-1 uppercase tracking-wider">
                  Stock Units
                </Text>
                <TextInput
                  value={stockQuantity}
                  onChangeText={setStockQuantity}
                  placeholder="Stock"
                  placeholderTextColor="#5b6a82"
                  keyboardType="numeric"
                  className="bg-[#1c263d] rounded-2xl px-3.5 py-3 text-xs font-bold text-white border border-[#2d3a58]"
                />
              </View>

              <View className="flex-1">
                <Text className="text-[11px] font-bold text-[#8c9ba5] mb-1 uppercase tracking-wider">
                  Promo Badge
                </Text>
                <TextInput
                  value={badge}
                  onChangeText={setBadge}
                  placeholder="Badge text"
                  placeholderTextColor="#5b6a82"
                  className="bg-[#1c263d] rounded-2xl px-3.5 py-3 text-xs font-bold text-white border border-[#2d3a58]"
                />
              </View>
            </View>

            {/* Image URL */}
            <View className="mb-6">
              <Text className="text-[11px] font-bold text-[#8c9ba5] mb-1 uppercase tracking-wider">
                Product Image URL
              </Text>
              <TextInput
                value={image}
                onChangeText={setImage}
                placeholder="https://..."
                placeholderTextColor="#5b6a82"
                className="bg-[#1c263d] rounded-2xl px-4 py-3 text-xs font-bold text-white border border-[#2d3a58]"
              />
            </View>

            {/* Action Save Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={saving}
              className="bg-[#006948] rounded-2xl py-3.5 items-center justify-center flex-row gap-2 shadow-lg mb-4"
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Icon name="check-circle" size={20} color="#ffffff" />
                  <Text className="text-sm font-extrabold text-white uppercase tracking-wider">
                    {product ? 'Save SKU Changes' : 'Publish Product to Catalog'}
                  </Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
