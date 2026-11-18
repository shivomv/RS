import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  RefreshControl,
  BackHandler,
  ToastAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BlinkitHeader from '../../components/BlinkitHeader';
import BlinkitProductCard from '../../components/BlinkitProductCard';
import BlinkitCartStrip from '../../components/BlinkitCartStrip';
import ServiceabilityBanner from '../../components/ServiceabilityBanner';
import LocationSelectorModal from '../../components/LocationSelectorModal';
import { ProductCardSkeleton, CategorySkeleton } from '../../components/Skeleton';
import { useCartStore } from '../../store/cartStore';
import { useCompanyStore } from '../../store/companyStore';
import { useLocationStore } from '../../store/locationStore';
import { api } from '../../services/api';

export default function ShopkeeperHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { items, addItem, removeItem, updateQuantity, itemCount } = useCartStore();
  const { ensureLoaded: loadCompanyDetails } = useCompanyStore();
  const { initLocation } = useLocationStore();

  const [dbProducts, setDbProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('ALL');
  const lastBackPressRef = React.useRef(0);

  // Android Double Back to Exit
  useEffect(() => {
    const onBackPress = () => {
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPressRef.current = now;
      if (Platform.OS === 'android') {
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      }
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    initLocation();
  }, [initLocation]);

  const loadData = useCallback(async () => {
    try {
      await loadCompanyDetails();
      const [prodRes, catRes] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getCategories().catch(() => []),
      ]);
      setDbProducts(Array.isArray(prodRes) ? prodRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
    } catch (err) {
      console.error('[Home] Load error:', err.message);
    }
  }, [loadCompanyDetails]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    loadData().then(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  const getItemQuantity = (productId) => {
    const match = items.find((i) => (i.product?._id || i._id) === productId);
    return match ? match.quantity : 0;
  };

  const handleUpdateQty = (product, delta) => {
    const pId = product._id || product.id;
    const currentQty = getItemQuantity(pId);
    const nextQty = Math.max(0, currentQty + delta);

    if (nextQty > 0) {
      if (currentQty === 0) {
        addItem({ ...product, _id: pId, quantity: nextQty });
      } else {
        updateQuantity(pId, nextQty);
      }
    } else {
      removeItem(pId);
    }
  };

  // Filtered products by search & selected category
  const filteredProducts = useMemo(() => {
    return dbProducts.filter((p) => {
      const matchesSearch =
        !search ||
        (p.name || p.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCatId === 'ALL' ||
        String(p.category || '').toLowerCase() === String(selectedCatId).toLowerCase() ||
        String(p.categoryId || '') === String(selectedCatId);

      return matchesSearch && matchesCat;
    });
  }, [dbProducts, search, selectedCatId]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#f8fafc]">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Signature Blinkit Header */}
      <BlinkitHeader navigation={navigation} />

      {/* Out-of-Stock / Service Unavailable Banner */}
      <ServiceabilityBanner />

      {/* Blinkit Floating Search Bar (Pinned) */}
      <View className="px-3.5 pt-2 pb-2 bg-white border-b border-[#e2e8f0]/80">
        <View className="flex-row items-center bg-[#f1f5f9] rounded-2xl border border-[#cbd5e1]/60 px-3.5 h-11 shadow-xs">
          <Icon name="search" size={20} color="#006948" />
          <TextInput
            placeholder='Search "floor cleaner", "phenyl 5L", "detergent"...'
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            className="flex-1 h-full ml-2 text-xs font-semibold text-[#0f172a]"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7} className="p-1">
              <Icon name="close" size={18} color="#64748b" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Catalog')}
              activeOpacity={0.7}
              className="flex-row items-center gap-1 bg-[#006948]/10 px-2.5 py-1 rounded-xl"
            >
              <Icon name="grid-view" size={14} color="#006948" />
              <Text className="text-[10px] font-black text-[#006948] uppercase">Aisles</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-1 relative">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: itemCount() > 0 ? 80 : 30 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#006948"
              colors={['#006948']}
            />
          }
        >
          {/* Blinkit Horizontal Categories / Aisles Bar */}
          <View className="bg-white py-2.5 border-b border-[#e2e8f0]">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="pl-3.5"
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {/* 'ALL' Chip */}
              <TouchableOpacity
                onPress={() => setSelectedCatId('ALL')}
                activeOpacity={0.8}
                className={`px-3.5 py-1.5 rounded-full mr-2 border flex-row items-center gap-1.5 ${
                  selectedCatId === 'ALL'
                    ? 'bg-[#006948] border-[#006948]'
                    : 'bg-[#f8fafc] border-[#e2e8f0]'
                }`}
              >
                <Icon
                  name="dashboard"
                  size={14}
                  color={selectedCatId === 'ALL' ? '#ffffff' : '#64748b'}
                />
                <Text
                  className={`text-xs font-black ${
                    selectedCatId === 'ALL' ? 'text-white' : 'text-[#475569]'
                  }`}
                >
                  All Products
                </Text>
              </TouchableOpacity>

              {/* Dynamic Categories */}
              {categories.map((cat, idx) => {
                const catName = cat.name || cat.title || 'Category';
                const isSelected =
                  String(selectedCatId).toLowerCase() === String(catName).toLowerCase() ||
                  String(selectedCatId) === String(cat._id);

                return (
                  <TouchableOpacity
                    key={cat._id || idx}
                    onPress={() => setSelectedCatId(isSelected ? 'ALL' : cat.name || cat._id)}
                    activeOpacity={0.8}
                    className={`px-3.5 py-1.5 rounded-full mr-2 border flex-row items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#006948] border-[#006948]'
                        : 'bg-[#f8fafc] border-[#e2e8f0]'
                    }`}
                  >
                    <Icon
                      name="cleaning-services"
                      size={14}
                      color={isSelected ? '#ffffff' : '#64748b'}
                    />
                    <Text
                      className={`text-xs font-black ${
                        isSelected ? 'text-white' : 'text-[#475569]'
                      }`}
                    >
                      {catName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Blinkit Quick Highlights / Value Props Banner */}
          <View className="px-3.5 py-2.5">
            <View className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <View className="w-9 h-9 rounded-xl bg-[#006948] justify-center items-center shadow-xs">
                  <Icon name="verified" size={20} color="#ffffff" />
                </View>
                <View>
                  <Text className="text-xs font-black text-[#0f172a]">
                    Factory-Direct Wholesale
                  </Text>
                  <Text className="text-[10px] text-[#006948] font-bold">
                    100% Genuine Lab-Tested Formulations
                  </Text>
                </View>
              </View>
              <View className="bg-white px-2.5 py-1 rounded-xl border border-[#bbf7d0]">
                <Text className="text-[10px] font-black text-[#006948]">COD Available</Text>
              </View>
            </View>
          </View>

          {/* Blinkit 2-Column Product Grid */}
          <View className="px-3.5 pt-1">
            <View className="flex-row items-center justify-between mb-2.5">
              <View>
                <Text className="text-sm font-black text-[#0f172a]">
                  {selectedCatId === 'ALL' ? 'Explore RS Catalog' : selectedCatId}
                </Text>
                <Text className="text-[10px] font-bold text-[#64748b]">
                  Showing {filteredProducts.length} wholesale options
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Catalog')}
                activeOpacity={0.7}
                className="flex-row items-center gap-0.5"
              >
                <Text className="text-xs font-black text-[#006948]">See All Aisles</Text>
                <Icon name="chevron-right" size={16} color="#006948" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="flex-row flex-wrap justify-between">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </View>
            ) : filteredProducts.length === 0 ? (
              <View className="py-12 items-center justify-center bg-white rounded-2xl border border-[#e2e8f0]">
                <Icon name="search-off" size={44} color="#94a3b8" />
                <Text className="text-sm font-black text-[#0f172a] mt-2">No Products Found</Text>
                <Text className="text-xs text-[#64748b] mt-1 text-center px-4">
                  Try searching for another cleaning item or switch category
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {filteredProducts.map((product) => {
                  const pId = product._id || product.id;
                  const qty = getItemQuantity(pId);

                  return (
                    <BlinkitProductCard
                      key={pId}
                      product={product}
                      quantity={qty}
                      onPress={() => navigation.navigate('ProductDetail', { product })}
                      onAdd={() => handleUpdateQty(product, 1)}
                      onIncrement={() => handleUpdateQty(product, 1)}
                      onDecrement={() => handleUpdateQty(product, -1)}
                    />
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Docked Blinkit Sticky Cart Bar */}
        <BlinkitCartStrip navigation={navigation} />
      </View>

      <LocationSelectorModal />
    </SafeAreaView>
  );
}
