import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Switch,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { adminApi } from '../services/api';
import { ProductCardSkeleton, SkeletonList } from '../components/Skeletons';
import Alert from '../utils/alert';

export default function ProductManagementScreen({
  products: initialProducts = [],
  categories: initialCategories = [],
  onRefresh,
}) {
  const [productList, setProductList] = useState(initialProducts);
  const [categoryList, setCategoryList] = useState(initialCategories);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const loadScreenData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        adminApi.getProducts().catch(() => []),
        adminApi.getCategories().catch(() => []),
      ]);
      setProductList(Array.isArray(prodRes) ? prodRes : (prodRes?.data || []));
      setCategoryList(Array.isArray(catRes) ? catRes : (catRes?.data || []));
    } catch (err) {
      console.error('[ProductManagementScreen] Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadScreenData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadScreenData();
    if (typeof onRefresh === 'function') {
      onRefresh();
    }
  };

  // Navigation View State: 'list' | 'view' | 'editor'
  const [activeView, setActiveView] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Editor Sub-Tab: 'basic' | 'pricing' | 'images' | 'bundles'
  const [activeEditorTab, setActiveEditorTab] = useState('basic');

  // Product Form Fields State
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('RS Pro');
  const [category, setCategory] = useState('Floor Cleaners');
  const [badge, setBadge] = useState('Factory Direct');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [image, setImage] = useState('');
  const [baseImages, setBaseImages] = useState([]);

  // Bundles Form State
  const [bundles, setBundles] = useState([]);
  const [newBundleLabel, setNewBundleLabel] = useState('Box Pack (12 Units)');
  const [newBundleQty, setNewBundleQty] = useState('12');
  const [newBundlePrice, setNewBundlePrice] = useState('');
  const [newBundleMrp, setNewBundleMrp] = useState('');

  const [saving, setSaving] = useState(false);

  // Open Product View Page
  const openViewPage = (prod) => {
    setSelectedProduct(prod);
    setActiveView('view');
  };

  // Open Product Editor Page (Add or Edit)
  const openEditorPage = (prod = null) => {
    if (prod) {
      setSelectedProduct(prod);
      setName(prod.name || '');
      setSubtitle(prod.subtitle || '');
      setDescription(prod.description || '');
      setBrand(prod.brand || 'RS Pro');
      setCategory(prod.category?.name || prod.category || 'Floor Cleaners');
      setBadge(prod.badge || 'Factory Direct');
      setPrice(String(prod.price || ''));
      setMrp(String(prod.mrp || prod.price || ''));
      setStockQuantity(String(prod.stockQuantity || '100'));
      setDisplayOrder(String(prod.displayOrder || '1'));
      setIsActive(prod.isActive !== false);
      setIsFeatured(Boolean(prod.isFeatured));
      setImage(prod.image || '');
      setBaseImages(prod.baseImages || []);
      setBundles(prod.bundles || []);
    } else {
      setSelectedProduct(null);
      setName('');
      setSubtitle('500ml Bottle');
      setDescription('High-efficiency industrial grade liquid cleaning formula manufactured by RS Industries.');
      setBrand('RS Pro');
      setCategory(categoryList[0]?.name || 'Floor Cleaners');
      setBadge('Factory Direct');
      setPrice('');
      setMrp('');
      setStockQuantity('100');
      setDisplayOrder('1');
      setIsActive(true);
      setIsFeatured(false);
      setImage('');
      setBaseImages([]);
      setBundles([
        {
          bundleId: `BNDL-10`,
          label: 'Box of 10 Bottles',
          quantity: 10,
          price: 900,
          mrp: 1200,
          stockQuantity: 50,
        },
      ]);
    }
    setActiveEditorTab('basic');
    setActiveView('editor');
  };

  const handlePickMainImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: true,
        quality: 0.6,
        maxWidth: 800,
        maxHeight: 800,
      });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imgUri = asset.base64
          ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        if (imgUri) {
          setImage(imgUri);
        }
      }
    } catch (err) {
      Alert.alert('Gallery Error', 'Could not open device gallery');
    }
  };

  const handlePickMultipleGalleryImages = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 5,
        includeBase64: true,
        quality: 0.6,
        maxWidth: 800,
        maxHeight: 800,
      });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const newUrls = result.assets
          .map((asset) => (asset.base64 ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}` : asset.uri))
          .filter(Boolean);
        setBaseImages((prev) => [...prev, ...newUrls]);
      }
    } catch (err) {
      Alert.alert('Gallery Error', 'Could not open device gallery');
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setBaseImages(baseImages.filter((_, idx) => idx !== index));
  };

  const applyPreset = (presetLabel, presetQty) => {
    setNewBundleLabel(presetLabel);
    setNewBundleQty(String(presetQty));
    if (price && Number(price) > 0) {
      const singlePrice = Number(price);
      const estPrice = Math.round(singlePrice * presetQty * 0.95);
      setNewBundlePrice(String(estPrice));
      if (mrp && Number(mrp) > 0) {
        setNewBundleMrp(String(Number(mrp) * presetQty));
      }
    }
  };

  const handleAddBundle = () => {
    if (!newBundleLabel.trim() || !newBundlePrice) {
      Alert.alert('Bundle Error', 'Bundle label and price are required');
      return;
    }
    const qty = Number(newBundleQty) || 1;
    const unitPrice = Number(newBundlePrice);
    const unitMrp = Number(newBundleMrp || newBundlePrice);

    const newBndl = {
      bundleId: `BNDL-${Date.now().toString().slice(-6)}`,
      label: newBundleLabel.trim(),
      quantity: qty,
      price: unitPrice,
      mrp: unitMrp,
      stockQuantity: 100,
      isDefault: bundles.length === 0,
    };
    setBundles((prev) => [...prev, newBndl]);
    setNewBundleLabel('');
    setNewBundleQty('');
    setNewBundlePrice('');
    setNewBundleMrp('');
  };

  const handleRemoveBundle = (idx) => {
    setBundles(bundles.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = async () => {
    if (!name.trim() || !price) {
      Alert.alert('Validation Error', 'Product Name and Price are required.');
      return;
    }

    setSaving(true);
    try {
      const formattedBundles = (bundles || []).map((b, i) => ({
        bundleId: b.bundleId || `BNDL-${i + 1}`,
        label: b.label || `Pack of ${b.quantity || 1}`,
        quantity: Number(b.quantity || 1),
        price: Number(b.price || price),
        mrp: Number(b.mrp || b.price || price),
        stockQuantity: Number(b.stockQuantity || 100),
        isDefault: Boolean(b.isDefault || i === 0),
      }));

      const payload = {
        name: (name || '').trim(),
        subtitle: (subtitle || '').trim(),
        description: (description || '').trim(),
        brand: (brand || 'RS Pro').trim(),
        category,
        badge: (badge || 'Factory Direct').trim(),
        price: Number(price),
        mrp: Number(mrp || price),
        stockQuantity: Number(stockQuantity || 100),
        displayOrder: Number(displayOrder || 1),
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
        image: (image || '').trim(),
        baseImages: (baseImages || []).filter(Boolean),
        bundles: formattedBundles,
      };

      if (selectedProduct?._id) {
        await adminApi.updateProduct(selectedProduct._id, payload);
        Alert.alert('Product Saved', `Updated ${name} with ${formattedBundles.length} bundle tier(s).`);
      } else {
        await adminApi.createProduct(payload);
        Alert.alert('Product Published', `Published ${name} with ${formattedBundles.length} bundle tier(s).`);
      }

      setActiveView('list');
      loadScreenData();
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      Alert.alert('Save Failed', err.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = (id, prodName) => {
    Alert.alert(
      'Delete Product',
      `Permanently remove "${prodName}" from the catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteProduct(id);
              Alert.alert('Deleted', `${prodName} removed.`);
              setActiveView('list');
              loadScreenData();
              if (typeof onRefresh === 'function') onRefresh();
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  // Filter Products List
  const filteredList = productList.filter((p) => {
    const matchCategory =
      selectedCategory === 'ALL' ||
      String(p.category?.name || p.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const matchQuery =
      !searchQuery.trim() ||
      String(p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  // PAGE 1: DEDICATED FULL PRODUCT VIEW PAGE
  if (activeView === 'view' && selectedProduct) {
    const images = [selectedProduct.image, ...(selectedProduct.baseImages || [])].filter(Boolean);

    return (
      <View className="flex-1 bg-background">
        {/* Top View Header */}
        <View className="bg-surface border-b border-border px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <Pressable
              onPress={() => setActiveView('list')}
              className="w-10 h-10 rounded-2xl bg-input justify-center items-center border border-border active:opacity-70"
            >
              <Icon name="arrow-back" size={22} color="#006948" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-base font-black text-ink" numberOfLines={1}>
                {selectedProduct.name}
              </Text>
              <Text className="text-[10px] text-muted font-bold">Product Specifications View</Text>
            </View>
          </View>

          <Pressable
            onPress={() => openEditorPage(selectedProduct)}
            className="bg-brand px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 shadow-md active:opacity-90"
          >
            <Icon name="edit" size={16} color="#ffffff" />
            <Text className="text-xs font-extrabold text-white">Edit Product</Text>
          </Pressable>
        </View>

        {/* View Page Scroll Body */}
        <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 60 }}>
          {/* Primary Product Image Banner */}
          <View className="items-center mb-4 bg-surface rounded-3xl p-5 border border-border shadow-xl">
            {selectedProduct.image ? (
              <Image
                source={{ uri: selectedProduct.image }}
                className="w-52 h-52 rounded-2xl"
                resizeMode="contain"
              />
            ) : (
              <View className="w-52 h-52 rounded-2xl bg-input items-center justify-center border border-border">
                <Icon name="inventory-2" size={48} color="#94a3b8" />
                <Text className="text-[11px] font-bold text-muted mt-2">No Image Available</Text>
              </View>
            )}
          </View>

          {/* Product Header & Subtitle */}
          <View className="bg-surface rounded-3xl p-5 mb-4 border border-border shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-black text-ink flex-1 pr-2">{selectedProduct.name}</Text>
              <View className="bg-[#006948]/20 px-3 py-1 rounded-full border border-[#006948]/40">
                <Text className="text-xs font-black text-brand-dim">{selectedProduct.badge || 'Wholesale'}</Text>
              </View>
            </View>

            <Text className="text-xs font-bold text-muted">
              {selectedProduct.subtitle || '500ml Bottle'} • Brand: {selectedProduct.brand || 'RS Pro'}
            </Text>
          </View>

          {/* Pricing & Stock Card */}
          <View className="bg-surface rounded-3xl p-5 mb-4 border border-border flex-row items-center justify-between shadow-sm">
            <View>
              <Text className="text-[10px] font-bold text-muted uppercase tracking-wider">Wholesale Price</Text>
              <View className="flex-row items-baseline gap-2 mt-0.5">
                <Text className="text-2xl font-black text-brand-dim">₹{selectedProduct.price}</Text>
                {selectedProduct.mrp && Number(selectedProduct.mrp) > Number(selectedProduct.price) ? (
                  <Text className="text-xs text-faint line-through">MRP: ₹{selectedProduct.mrp}</Text>
                ) : null}
              </View>
            </View>

            <View className="bg-input px-4 py-2.5 rounded-2xl border border-border items-end">
              <Text className="text-[10px] font-bold text-muted">Stock Level</Text>
              <Text className="text-sm font-black text-ink">{selectedProduct.stockQuantity || 100} Units</Text>
            </View>
          </View>

          {/* Full Description Card */}
          <View className="bg-surface rounded-3xl p-5 mb-4 border border-border">
            <Text className="text-xs font-black text-ink uppercase tracking-wider mb-2">
              Full Product Specifications & Description
            </Text>
            <Text className="text-xs text-secondary leading-relaxed">
              {selectedProduct.description ||
                'High-efficiency industrial grade liquid cleaning formula manufactured by RS Industries for factory and commercial usage.'}
            </Text>
          </View>

          {/* Taxonomy Specs Card */}
          <View className="bg-surface rounded-3xl p-5 mb-4 border border-border">
            <Text className="text-xs font-black text-ink uppercase tracking-wider mb-3">
              Taxonomy & Placement
            </Text>
            <View className="flex-row justify-between py-1.5 border-b border-border">
              <Text className="text-xs text-muted">Category:</Text>
              <Text className="text-xs font-bold text-ink">
                {selectedProduct.category?.name || selectedProduct.category || 'General'}
              </Text>
            </View>
            <View className="flex-row justify-between py-1.5 border-b border-border">
              <Text className="text-xs text-muted">Catalog Sort Order:</Text>
              <Text className="text-xs font-bold text-ink">#{selectedProduct.displayOrder || 1}</Text>
            </View>
            <View className="flex-row justify-between py-1.5">
              <Text className="text-xs text-muted">Buyer Visibility:</Text>
              <Text className="text-xs font-bold text-brand-dim">
                {selectedProduct.isActive !== false ? '● Active in Buyer App' : '○ Inactive'}
              </Text>
            </View>
          </View>

          {/* Gallery Photos */}
          {images.length > 1 && (
            <View className="bg-surface rounded-3xl p-5 mb-4 border border-border">
              <Text className="text-xs font-black text-ink uppercase tracking-wider mb-3">
                Gallery Photos ({images.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {images.map((url, idx) => (
                  <Image key={idx} source={{ uri: url }} className="w-20 h-20 rounded-2xl bg-input mr-2 border border-border" />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Configured Bundles */}
          {selectedProduct.bundles?.length > 0 && (
            <View className="bg-surface rounded-3xl p-5 mb-5 border border-border">
              <Text className="text-xs font-black text-ink uppercase tracking-wider mb-3">
                Configured Bulk Bundles ({selectedProduct.bundles.length})
              </Text>
              {selectedProduct.bundles.map((bndl, idx) => (
                <View key={idx} className="bg-input p-3.5 rounded-2xl mb-2 flex-row justify-between items-center border border-border">
                  <View>
                    <Text className="text-xs font-black text-ink">{bndl.label}</Text>
                    <Text className="text-[10px] text-muted">{bndl.quantity} units per pack</Text>
                  </View>
                  <Text className="text-sm font-black text-brand-dim">₹{bndl.price}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Edit Button */}
          <Pressable
            onPress={() => openEditorPage(selectedProduct)}
            className="bg-brand rounded-2xl py-4 items-center justify-center flex-row gap-2 shadow-xl mb-4 active:opacity-90"
          >
            <Icon name="edit" size={20} color="#ffffff" />
            <Text className="text-sm font-black text-white uppercase tracking-wider">
              Edit Product Specifications
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // PAGE 2: DEDICATED FULL PRODUCT EDITOR PAGE (ADD OR EDIT)
  if (activeView === 'editor') {
    return (
      <View className="flex-1 bg-background">
        {/* Top Editor Header */}
        <View className="bg-surface border-b border-border px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <Pressable
              onPress={() => setActiveView('list')}
              className="w-10 h-10 rounded-2xl bg-input justify-center items-center border border-border active:opacity-70"
            >
              <Icon name="arrow-back" size={22} color="#006948" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-base font-black text-ink" numberOfLines={1}>
                {selectedProduct ? `Edit SKU: ${name || 'Product'}` : 'Create New Product SKU'}
              </Text>
              <Text className="text-[10px] text-muted font-bold">Catalog SKU Editor</Text>
            </View>
          </View>
        </View>

        {/* Editor Sub-Tab Navigation Bar */}
        <View className="flex-row bg-surface border-b border-border px-3 py-2 gap-1.5">
          {[
            { key: 'basic', label: 'Basic Info', icon: 'info' },
            { key: 'pricing', label: 'Price', icon: 'payments' },
            { key: 'images', label: 'Images', icon: 'photo-library' },
            { key: 'bundles', label: 'Bundles', icon: 'inventory-2' },
          ].map((tab) => {
            const isTabActive = activeEditorTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveEditorTab(tab.key)}
                className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 ${
                  isTabActive ? 'bg-brand' : 'bg-input active:bg-border'
                }`}
              >
                <Icon name={tab.icon} size={15} color={isTabActive ? '#ffffff' : '#94a3b8'} />
                <Text className={`text-[11px] font-extrabold ${isTabActive ? 'text-white' : 'text-muted'}`}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Editor Form Body */}
        <ScrollView className="flex-1 p-5" contentContainerStyle={{ paddingBottom: 60 }}>
          {/* SUB-TAB 1: BASIC INFO */}
          {activeEditorTab === 'basic' && (
            <View>
              <View className="mb-4">
                <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
                  Product Name *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Ultra-Clean Floor Cleaner"
                  placeholderTextColor="#94a3b8"
                  className="bg-surface rounded-2xl px-4 py-3.5 text-sm font-bold text-ink border border-border"
                />
              </View>

              <View className="mb-4">
                <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
                  Subtitle / Packaging Size
                </Text>
                <TextInput
                  value={subtitle}
                  onChangeText={setSubtitle}
                  placeholder="e.g. 500ml Bottle or 50L Drum"
                  placeholderTextColor="#94a3b8"
                  className="bg-surface rounded-2xl px-4 py-3.5 text-sm font-bold text-ink border border-border"
                />
              </View>

              <View className="mb-4">
                <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
                  Full Product Description
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter detailed specifications..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  className="bg-surface rounded-2xl px-4 py-3.5 text-xs font-bold text-ink border border-border min-h-[90px]"
                />
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
                    Category
                  </Text>
                  <TextInput
                    value={category}
                    onChangeText={setCategory}
                    placeholder="Category"
                    placeholderTextColor="#94a3b8"
                    className="bg-surface rounded-2xl px-3.5 py-3 text-xs font-bold text-ink border border-border"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
                    Brand Name
                  </Text>
                  <TextInput
                    value={brand}
                    onChangeText={setBrand}
                    placeholder="Brand"
                    placeholderTextColor="#94a3b8"
                    className="bg-surface rounded-2xl px-3.5 py-3 text-xs font-bold text-ink border border-border"
                  />
                </View>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
                    Promo Badge
                  </Text>
                  <TextInput
                    value={badge}
                    onChangeText={setBadge}
                    placeholder="e.g. Bulk MOQ"
                    placeholderTextColor="#94a3b8"
                    className="bg-surface rounded-2xl px-3.5 py-3 text-xs font-bold text-ink border border-border"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
                    Display Order
                  </Text>
                  <TextInput
                    value={displayOrder}
                    onChangeText={setDisplayOrder}
                    placeholder="1"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    className="bg-surface rounded-2xl px-3.5 py-3 text-xs font-bold text-ink border border-border"
                  />
                </View>
              </View>

              {/* Active Toggle */}
              <View className="bg-surface rounded-2xl p-4 mb-4 border border-border flex-row items-center justify-between">
                <View>
                  <Text className="text-xs font-extrabold text-ink">Catalog Active Status</Text>
                  <Text className="text-[10px] text-muted">Visible to buyers in shop app</Text>
                </View>
                <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: '#006948', false: '#334155' }} />
              </View>
            </View>
          )}

          {/* SUB-TAB 2: PRICING & STOCK */}
          {activeEditorTab === 'pricing' && (
            <View>
              <View className="mb-4">
                <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
                  Wholesale Price (₹) *
                </Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="e.g. 99"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  className="bg-surface rounded-2xl px-4 py-4 text-lg font-black text-brand-dim border border-border"
                />
              </View>

              <View className="mb-4">
                <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
                  Retail MRP (₹)
                </Text>
                <TextInput
                  value={mrp}
                  onChangeText={setMrp}
                  placeholder="e.g. 150"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  className="bg-surface rounded-2xl px-4 py-4 text-lg font-black text-[#8c9ba5] border border-border"
                />
              </View>

              <View className="mb-4">
                <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
                  Available Stock Units
                </Text>
                <TextInput
                  value={stockQuantity}
                  onChangeText={setStockQuantity}
                  placeholder="100"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  className="bg-surface rounded-2xl px-4 py-4 text-sm font-black text-ink border border-border"
                />
              </View>
            </View>
          )}

          {/* SUB-TAB 3: IMAGES */}
          {activeEditorTab === 'images' && (
            <View>
              {/* Main Cover Image */}
              <View className="bg-surface rounded-3xl p-5 mb-5 border border-border">
                <Text className="text-xs font-black text-ink uppercase tracking-wider mb-2">
                  Primary Cover Photo
                </Text>
                <Text className="text-[11px] text-muted mb-3">
                  This image is shown on catalog cards and search results.
                </Text>

                {image ? (
                  <View className="mb-4 items-center">
                    <Image
                      source={{ uri: image }}
                      className="w-48 h-48 rounded-2xl bg-input border border-border mb-3"
                      resizeMode="contain"
                    />
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={handlePickMainImage}
                        className="bg-brand px-4 py-2 rounded-xl flex-row items-center gap-1.5 active:opacity-90"
                      >
                        <Icon name="photo-library" size={16} color="#ffffff" />
                        <Text className="text-xs font-bold text-white">Change Photo</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setImage('')}
                        className="bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/30 flex-row items-center gap-1.5 active:opacity-90"
                      >
                        <Icon name="delete" size={16} color="#ef4444" />
                        <Text className="text-xs font-bold text-red-500">Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    onPress={handlePickMainImage}
                    className="border-2 border-dashed border-border rounded-2xl p-6 items-center justify-center bg-input/50 mb-3 active:opacity-75"
                  >
                    <Icon name="add-photo-alternate" size={36} color="#006948" />
                    <Text className="text-xs font-extrabold text-ink mt-2">Select Main Photo from Gallery</Text>
                    <Text className="text-[10px] text-muted mt-0.5">Pick from phone gallery or camera roll</Text>
                  </Pressable>
                )}
              </View>

              {/* Multiple Gallery Photos */}
              <View className="bg-surface rounded-3xl p-5 mb-5 border border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs font-black text-ink uppercase tracking-wider">
                    Additional Gallery Photos ({baseImages.length})
                  </Text>
                  <Pressable
                    onPress={handlePickMultipleGalleryImages}
                    className="bg-brand px-3 py-1.5 rounded-xl flex-row items-center gap-1 active:opacity-90"
                  >
                    <Icon name="collections" size={16} color="#ffffff" />
                    <Text className="text-xs font-bold text-white">Pick Multiple</Text>
                  </Pressable>
                </View>
                <Text className="text-[11px] text-muted mb-3">
                  Select multiple high-res product photos from your device gallery.
                </Text>

                <Pressable
                  onPress={handlePickMultipleGalleryImages}
                  className="border-2 border-dashed border-border rounded-2xl p-5 items-center justify-center bg-input/50 mb-4 active:opacity-75"
                >
                  <Icon name="photo-library" size={32} color="#006948" />
                  <Text className="text-xs font-extrabold text-ink mt-1.5">
                    Select Multiple Photos from Gallery
                  </Text>
                  <Text className="text-[10px] text-muted mt-0.5">Select multiple images at once</Text>
                </Pressable>

                {/* Gallery Thumbnail Grid */}
                {baseImages.length > 0 && (
                  <View className="flex-row flex-wrap gap-2.5">
                    {baseImages.map((imgUrl, idx) => (
                      <View
                        key={idx}
                        className="relative w-24 h-24 rounded-2xl overflow-hidden bg-input border border-border shadow-sm"
                      >
                        <Image source={{ uri: imgUrl }} className="w-full h-full" resizeMode="cover" />
                        <Pressable
                          onPress={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1 right-1 bg-black/70 w-6 h-6 rounded-full items-center justify-center"
                        >
                          <Icon name="close" size={14} color="#ffffff" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* SUB-TAB 4: BUNDLES */}
          {activeEditorTab === 'bundles' && (
            <View>
              {/* Quick Presets Bar */}
              <View className="mb-4">
                <Text className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
                  Quick Presets (Tap to Fill)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {[
                    { label: 'Pack of 6', qty: 6 },
                    { label: 'Box of 12', qty: 12 },
                    { label: 'Case of 24', qty: 24 },
                    { label: 'Carton of 48', qty: 48 },
                  ].map((p) => (
                    <Pressable
                      key={p.qty}
                      onPress={() => applyPreset(p.label, p.qty)}
                      className="bg-surface px-3.5 py-2 rounded-2xl border border-border mr-2 active:bg-input flex-row items-center gap-1.5 shadow-sm"
                    >
                      <Icon name="bolt" size={14} color="#006948" />
                      <Text className="text-xs font-black text-ink">{p.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Simple Add Form */}
              <View className="bg-surface p-4 rounded-2xl mb-4 border border-border shadow-sm">
                <Text className="text-xs font-black text-ink uppercase tracking-wider mb-3">
                  + Add Bundle Tier
                </Text>

                <View className="mb-3">
                  <Text className="text-[10px] font-bold text-muted mb-1">Bundle Title *</Text>
                  <TextInput
                    value={newBundleLabel}
                    onChangeText={setNewBundleLabel}
                    placeholder="e.g. Box of 12"
                    placeholderTextColor="#94a3b8"
                    className="bg-input rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink border border-border"
                  />
                </View>

                <View className="flex-row gap-3 mb-3">
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-muted mb-1">Quantity (Units) *</Text>
                    <TextInput
                      value={newBundleQty}
                      onChangeText={setNewBundleQty}
                      placeholder="12"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      className="bg-input rounded-xl px-3 py-2.5 text-xs font-bold text-ink border border-border"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-muted mb-1">Wholesale Price (₹) *</Text>
                    <TextInput
                      value={newBundlePrice}
                      onChangeText={setNewBundlePrice}
                      placeholder="1200"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      className="bg-input rounded-xl px-3 py-2.5 text-xs font-bold text-ink border border-border"
                    />
                  </View>
                </View>

                <Pressable
                  onPress={handleAddBundle}
                  className="bg-brand py-3 rounded-xl items-center justify-center flex-row gap-1.5 active:opacity-90 mt-1 shadow-sm"
                >
                  <Icon name="add" size={18} color="#ffffff" />
                  <Text className="text-xs font-black text-white uppercase tracking-wider">Add Bundle</Text>
                </Pressable>
              </View>

              {/* Active Bundles List */}
              <View className="mb-2">
                <Text className="text-xs font-black text-ink uppercase tracking-wider mb-2.5">
                  Configured Bundles ({bundles.length})
                </Text>

                {bundles.length === 0 ? (
                  <View className="py-8 items-center bg-surface rounded-2xl border border-dashed border-border">
                    <Icon name="inventory-2" size={30} color="#94a3b8" />
                    <Text className="text-xs font-bold text-muted mt-2">No custom bundles configured yet</Text>
                    <Text className="text-[10px] text-faint mt-0.5">Tap a preset above or enter details to offer bulk tiers</Text>
                  </View>
                ) : (
                  bundles.map((bndl, idx) => {
                    const unitRate = Math.round(Number(bndl.price) / (Number(bndl.quantity) || 1));
                    return (
                      <View
                        key={idx}
                        className="bg-surface rounded-2xl p-3.5 mb-2.5 border border-border flex-row items-center justify-between shadow-sm"
                      >
                        <View className="flex-1 pr-2">
                          <View className="flex-row items-center gap-2 mb-0.5">
                            <Text className="text-xs font-black text-ink">{bndl.label}</Text>
                            <View className="bg-brand/15 px-2 py-0.5 rounded-full border border-brand/30">
                              <Text className="text-[9px] font-black text-brand-dim">{bndl.quantity} Units</Text>
                            </View>
                          </View>
                          <Text className="text-[11px] text-muted font-medium">
                            ₹{unitRate} / unit
                          </Text>
                        </View>

                        <View className="flex-row items-center gap-3">
                          <Text className="text-sm font-black text-brand-dim">₹{bndl.price}</Text>
                          <Pressable
                            onPress={() => handleRemoveBundle(idx)}
                            className="w-8 h-8 rounded-xl bg-red-500/10 justify-center items-center active:opacity-70 border border-red-500/20"
                          >
                            <Icon name="delete-outline" size={18} color="#ef4444" />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          )}

          {/* Save Button */}
          <Pressable
            onPress={handleSaveProduct}
            disabled={saving}
            className="bg-brand rounded-2xl py-4 items-center justify-center flex-row gap-2 shadow-xl my-5 active:opacity-90"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Icon name="check-circle" size={20} color="#ffffff" />
                <Text className="text-sm font-black text-white uppercase tracking-wider">
                  {selectedProduct ? 'Save Product Changes' : 'Publish Product to Catalog'}
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // PAGE 3: MAIN DEDICATED PRODUCT LISTING PAGE (DEFAULT)
  return (
    <View className="flex-1 bg-background">
      {/* Top Header & Search Bar */}
      <View className="bg-surface border-b border-border p-4 pb-3">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1 pr-2">
            <Text className="text-base font-black text-ink">Products Catalog</Text>
            <Text className="text-[10px] text-muted font-bold">
              {filteredList.length} of {productList.length} Items
            </Text>
          </View>

          <Pressable
            onPress={() => openEditorPage(null)}
            className="bg-brand px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 shadow-sm active:opacity-90"
          >
            <Icon name="add" size={18} color="#ffffff" />
            <Text className="text-xs font-black text-white uppercase tracking-wider">
              Add Product
            </Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-input rounded-2xl px-3 py-2 border border-border mb-2.5">
          <Icon name="search" size={18} color="#94a3b8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products by name, brand, SKU..."
            placeholderTextColor="#94a3b8"
            className="flex-1 text-xs font-bold text-ink p-0 ml-2"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="close" size={16} color="#94a3b8" />
            </Pressable>
          ) : null}
        </View>

        {/* Category Filter Chips Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
          className="flex-row"
        >
          <Pressable
            onPress={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-full mr-2 border ${
              selectedCategory === 'ALL'
                ? 'bg-brand border-brand'
                : 'bg-input border-border active:bg-border'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                selectedCategory === 'ALL' ? 'text-white font-extrabold' : 'text-muted'
              }`}
            >
              All Categories
            </Text>
          </Pressable>
          {categoryList.map((cat) => {
            const isCatActive = selectedCategory.toLowerCase() === (cat.name || '').toLowerCase();
            return (
              <Pressable
                key={cat._id || cat.name}
                onPress={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                  isCatActive
                    ? 'bg-brand border-brand'
                    : 'bg-input border-border active:bg-border'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isCatActive ? 'text-white font-extrabold' : 'text-muted'
                  }`}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Product Cards List - Tapping ANY Card opens the Full Product View Page */}
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#006948" />
        }
      >
        {loading ? (
          <SkeletonList Component={ProductCardSkeleton} count={4} />
        ) : filteredList.length === 0 ? (
          <View className="py-16 items-center">
            <Icon name="inventory" size={48} color="#cbd5e1" />
            <Text className="text-sm font-bold text-muted mt-3">No matching products found</Text>
          </View>
        ) : (
          filteredList.map((prod) => (
            <Pressable
              key={prod._id}
              onPress={() => openViewPage(prod)}
              className="bg-surface rounded-3xl p-4 mb-4 border border-border shadow-xl overflow-hidden active:opacity-90"
            >
              {/* Product Top Header */}
              <View className="flex-row items-center gap-3.5 mb-3">
                {prod.image ? (
                  <Image
                    source={{ uri: prod.image }}
                    className="w-16 h-16 rounded-2xl bg-input"
                  />
                ) : (
                  <View className="w-16 h-16 rounded-2xl bg-input items-center justify-center border border-border">
                    <Icon name="inventory-2" size={24} color="#94a3b8" />
                  </View>
                )}

                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-sm font-black text-ink flex-1" numberOfLines={1}>
                      {prod.name}
                    </Text>
                    <View className="bg-[#006948]/20 px-2 py-0.5 rounded-full border border-[#006948]/40">
                      <Text className="text-[9px] font-black text-brand-dim">{prod.badge || 'Wholesale'}</Text>
                    </View>
                  </View>

                  <Text className="text-xs text-muted mb-1" numberOfLines={1}>
                    {prod.subtitle} • {prod.brand || 'RS Pro'}
                  </Text>

                  <View className="flex-row items-center gap-3">
                    <Text className="text-sm font-black text-brand-dim">₹{prod.price}</Text>
                    {prod.mrp && Number(prod.mrp) > Number(prod.price) ? (
                      <Text className="text-xs text-faint line-through">₹{prod.mrp}</Text>
                    ) : null}
                    <Text className="text-xs font-bold text-secondary">Stock: {prod.stockQuantity || 100}</Text>
                  </View>
                </View>
              </View>

              {/* Product Badges & Info Tags */}
              <View className="flex-row flex-wrap gap-2 py-2 border-t border-border mb-3">
                <View className="bg-input px-2.5 py-1 rounded-lg">
                  <Text className="text-[10px] font-bold text-muted">
                    Category: {prod.category?.name || prod.category || 'General'}
                  </Text>
                </View>
                {prod.bundles?.length > 0 && (
                  <View className="bg-[#3b82f6]/10 px-2.5 py-1 rounded-lg border border-[#3b82f6]/30">
                    <Text className="text-[10px] font-bold text-[#3b82f6]">
                      {prod.bundles.length} Bundles Configured
                    </Text>
                  </View>
                )}
                {prod.baseImages?.length > 0 && (
                  <View className="bg-[#8b5cf6]/10 px-2.5 py-1 rounded-lg border border-[#8b5cf6]/30">
                    <Text className="text-[10px] font-bold text-[#8b5cf6]">
                      {prod.baseImages.length} Gallery Photos
                    </Text>
                  </View>
                )}
              </View>

              {/* Card Bottom Management Action Buttons */}
              <View className="flex-row items-center gap-2 pt-2 border-t border-border">
                <Pressable
                  onPress={() => openViewPage(prod)}
                  className="flex-1 bg-input py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 border border-border active:opacity-80"
                >
                  <Icon name="visibility" size={16} color="#ffffff" />
                  <Text className="text-xs font-bold text-ink uppercase">View Specs</Text>
                </Pressable>

                <Pressable
                  onPress={() => openEditorPage(prod)}
                  className="flex-1 bg-brand py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 active:opacity-80"
                >
                  <Icon name="edit" size={16} color="#ffffff" />
                  <Text className="text-xs font-black text-white uppercase">Edit SKU</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleDeleteProduct(prod._id, prod.name)}
                  className="px-3 py-2.5 bg-[#ef4444]/10 rounded-xl border border-[#ef4444]/30 flex-row items-center justify-center active:opacity-80"
                >
                  <Icon name="delete" size={18} color="#ef4444" />
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
