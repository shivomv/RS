import React from 'react';
import { View, Text, Modal, ScrollView, Pressable, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProductDetailViewModal({
  visible,
  onClose,
  product = null,
  onEdit,
}) {
  if (!product) return null;

  const images = [product.image, ...(product.baseImages || [])].filter(Boolean);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/75 justify-center items-center p-3">
        <View className="bg-[#131b2e] rounded-3xl w-full max-w-lg border border-[#232d46] shadow-2xl overflow-hidden max-h-[92%]">
          {/* Header */}
          <View className="bg-[#1c263d] px-5 py-4 flex-row items-center justify-between border-b border-[#232d46]">
            <View className="flex-row items-center gap-2 flex-1 pr-2">
              <Icon name="inventory-2" size={22} color="#006948" />
              <Text className="text-base font-black text-white flex-1" numberOfLines={1}>
                {product.name}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-[#2d3a58] justify-center items-center active:opacity-70"
            >
              <Icon name="close" size={18} color="#ffffff" />
            </Pressable>
          </View>

          {/* Body Scroll View */}
          <ScrollView className="p-5">
            {/* Main Product Image Banner */}
            <View className="items-center mb-4 bg-[#0f172a] rounded-2xl border border-[#2d3a58] overflow-hidden">
              {product.image ? (
                <Image
                  source={{ uri: product.image }}
                  className="w-full h-52"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-48 h-48 rounded-2xl bg-[#1c263d] items-center justify-center border border-[#2d3a58]">
                  <Icon name="inventory-2" size={48} color="#64748b" />
                  <Text className="text-[11px] font-bold text-[#8c9ba5] mt-2">No Image Available</Text>
                </View>
              )}
            </View>

            {/* Title & Subtitle */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-lg font-black text-white flex-1 pr-2">{product.name}</Text>
                <View className="bg-[#006948]/20 px-3 py-1 rounded-full border border-[#006948]/40">
                  <Text className="text-xs font-black text-[#10b981]">{product.badge || 'Wholesale'}</Text>
                </View>
              </View>

              <Text className="text-xs font-bold text-[#94a3b8]">
                {product.subtitle || '500ml Bottle'} • Brand: {product.brand || 'RS Pro'}
              </Text>
            </View>

            {/* Pricing & Stock Card */}
            <View className="bg-[#1c263d] rounded-2xl p-4 mb-4 border border-[#2d3a58] flex-row items-center justify-between">
              <View>
                <Text className="text-[10px] font-bold text-[#8c9ba5] uppercase">Wholesale Price</Text>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-xl font-black text-[#10b981]">₹{product.price}</Text>
                  {product.mrp && Number(product.mrp) > Number(product.price) ? (
                    <Text className="text-xs text-[#64748b] line-through">MRP: ₹{product.mrp}</Text>
                  ) : null}
                </View>
              </View>

              <View className="bg-[#0f172a] px-3.5 py-2 rounded-xl border border-[#2d3a58] items-end">
                <Text className="text-[10px] font-bold text-[#8c9ba5]">In Stock Units</Text>
                <Text className="text-sm font-black text-white">{product.stockQuantity || 100} Available</Text>
              </View>
            </View>

            {/* Description */}
            <View className="bg-[#1c263d] rounded-2xl p-4 mb-4 border border-[#2d3a58]">
              <Text className="text-xs font-black text-white uppercase tracking-wider mb-2">
                Product Description & Specifications
              </Text>
              <Text className="text-xs text-[#cbd5e1] leading-relaxed">
                {product.description || 'High-efficiency industrial grade liquid cleaning formula manufactured by RS Industries.'}
              </Text>
            </View>

            {/* Category & Display Specs */}
            <View className="bg-[#1c263d] rounded-2xl p-4 mb-4 border border-[#2d3a58]">
              <Text className="text-xs font-black text-white uppercase tracking-wider mb-2">
                Taxonomy & Placement
              </Text>
              <Text className="text-xs text-[#94a3b8]">Category: {product.category?.name || product.category || 'General'}</Text>
              <Text className="text-xs text-[#94a3b8] mt-1">Catalog Display Order: #{product.displayOrder || 1}</Text>
              <Text className="text-xs text-[#94a3b8] mt-1">Status: {product.isActive !== false ? '● Active in Buyer App' : '○ Inactive'}</Text>
            </View>

            {/* Gallery Images */}
            {images.length > 1 && (
              <View className="bg-[#1c263d] rounded-2xl p-4 mb-4 border border-[#2d3a58]">
                <Text className="text-xs font-black text-white uppercase tracking-wider mb-3">
                  Gallery Photos ({images.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                  {images.map((url, idx) => (
                    <Image key={idx} source={{ uri: url }} className="w-16 h-16 rounded-xl bg-[#0f172a] mr-2" />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Configured Bundles */}
            {product.bundles?.length > 0 && (
              <View className="bg-[#1c263d] rounded-2xl p-4 mb-5 border border-[#2d3a58]">
                <Text className="text-xs font-black text-white uppercase tracking-wider mb-3">
                  Configured Bulk Bundles ({product.bundles.length})
                </Text>
                {product.bundles.map((bndl, idx) => (
                  <View key={idx} className="bg-[#0f172a] p-3 rounded-xl mb-2 flex-row justify-between items-center border border-[#2d3a58]">
                    <View>
                      <Text className="text-xs font-extrabold text-white">{bndl.label}</Text>
                      <Text className="text-[10px] text-[#94a3b8]">{bndl.quantity} units per pack</Text>
                    </View>
                    <Text className="text-xs font-black text-[#10b981]">₹{bndl.price}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Edit Action Button */}
            <Pressable
              onPress={() => {
                onClose();
                if (typeof onEdit === 'function') onEdit(product);
              }}
              className="bg-[#006948] rounded-2xl py-3.5 items-center justify-center flex-row gap-2 shadow-lg mb-4"
            >
              <Icon name="edit" size={18} color="#ffffff" />
              <Text className="text-xs font-extrabold text-white uppercase tracking-wider">
                Edit Product Specifications
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
