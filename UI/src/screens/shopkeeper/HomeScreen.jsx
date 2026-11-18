import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  BackHandler,
  ToastAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HyperlocalHeader from '../../components/HyperlocalHeader';
import HyperlocalProductCard from '../../components/HyperlocalProductCard';
import FloatingCartBar from '../../components/FloatingCartBar';
import LocationSelectorModal from '../../components/LocationSelectorModal';
import { ProductCardSkeleton } from '../../components/Skeleton';
import { useCartStore } from '../../store/cartStore';
import { useCompanyStore } from '../../store/companyStore';
import { useLocationStore } from '../../store/locationStore';
import { api } from '../../services/api';

export default function ShopkeeperHomeScreen({ navigation }) {
  const { items, addItem, removeItem, updateQuantity, itemCount } = useCartStore();
  const { ensureLoaded: loadCompanyDetails } = useCompanyStore();
  const { initLocation } = useLocationStore();

  const [dbProducts, setDbProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCatName, setSelectedCatName] = useState('ALL');
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

  const filteredProducts = useMemo(() => {
    return dbProducts.filter((p) => {
      const matchesSearch =
        !search ||
        (p.name || p.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCatName === 'ALL' ||
        String(p.category || '').toLowerCase() === String(selectedCatName).toLowerCase() ||
        String(p.categoryId || '') === String(selectedCatName);

      return matchesSearch && matchesCat;
    });
  }, [dbProducts, search, selectedCatName]);

  return (
    <View className="flex-1 bg-[#F4F6FB]">
      <StatusBar barStyle="light-content" backgroundColor="#006948" translucent={false} />

      {/* Brand Green Top Header (flows smoothly from status bar) */}
      <HyperlocalHeader
        navigation={navigation}
        search={search}
        onSearchChange={setSearch}
        onClearSearch={() => setSearch('')}
      />

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
          {/* Explore By Category: Left-Aligned Grid (4-columns with gap-2, no odd spacing) */}
          {categories.length > 0 && (
            <View className="mt-3.5 px-3.5">
              <View className="flex-row justify-between items-center mb-2 px-0.5">
                <Text className="text-xs font-black text-[#1C1C1C] uppercase tracking-wider">
                  Explore By Category
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Catalog')}
                  activeOpacity={0.7}
                >
                  <Text className="text-[11px] font-bold text-[#006948]">See all</Text>
                </TouchableOpacity>
              </View>

              {/* Left-aligned Flex-wrap Grid with fixed item widths and margin-right */}
              <View className="flex-row flex-wrap">
                {categories.map((cat, idx) => {
                  const catName = cat.name || cat.title || 'Category';
                  const isSelected =
                    String(selectedCatName).toLowerCase() === String(catName).toLowerCase() ||
                    String(selectedCatName) === String(cat._id);

                  // 4 items per row: 23% width, remainder 8% / 3 ~= 2.6% right margin for first 3 items in a row
                  const isRowEnd = (idx + 1) % 4 === 0;

                  return (
                    <TouchableOpacity
                      key={cat._id || idx}
                      onPress={() => setSelectedCatName(isSelected ? 'ALL' : catName)}
                      activeOpacity={0.8}
                      style={{
                        width: '23%',
                        marginRight: isRowEnd ? 0 : '2.66%',
                        marginBottom: 10,
                      }}
                      className={`rounded-xl p-2 items-center text-center border ${
                        isSelected
                          ? 'bg-[#EBF7EE] border-[#006948]'
                          : 'bg-white border-[#E8E8E8]'
                      }`}
                    >
                      <View className="w-11 h-11 rounded-lg bg-[#F8FAFC] items-center justify-center shadow-xs mb-1 overflow-hidden">
                        {cat.image ? (
                          <Image
                            source={{ uri: cat.image }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <Icon
                            name="cleaning-services"
                            size={22}
                            color={isSelected ? '#006948' : '#666666'}
                          />
                        )}
                      </View>
                      <Text
                        className={`text-[10px] font-bold text-center leading-tight ${
                          isSelected ? 'text-[#006948]' : 'text-[#1C1C1C]'
                        }`}
                        numberOfLines={2}
                      >
                        {catName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Bestsellers Section */}
          <View className="mt-3 px-3.5">
            <View className="flex-row justify-between items-end mb-2.5 px-0.5">
              <View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-sm font-black text-[#1C1C1C]">
                    {selectedCatName === 'ALL' ? 'Bestsellers' : selectedCatName}
                  </Text>
                  <View className="bg-[#EBF7EE] px-1.5 py-0.5 rounded">
                    <Text className="text-[#006948] text-[9px] font-black uppercase">
                      Factory Direct
                    </Text>
                  </View>
                </View>
                <Text className="text-[11px] text-[#666666]">
                  Showing {filteredProducts.length} items
                </Text>
              </View>
              {selectedCatName !== 'ALL' && (
                <TouchableOpacity
                  onPress={() => setSelectedCatName('ALL')}
                  activeOpacity={0.7}
                >
                  <Text className="text-[11px] font-bold text-[#006948]">View All</Text>
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View className="flex-row flex-wrap justify-between">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </View>
            ) : filteredProducts.length === 0 ? (
              <View className="py-12 items-center justify-center bg-white rounded-2xl border border-[#E8E8E8]">
                <Icon name="search-off" size={40} color="#94a3b8" />
                <Text className="text-sm font-black text-[#1C1C1C] mt-2">No Products Found</Text>
                <Text className="text-xs text-[#666666] mt-1 text-center px-4">
                  Try switching categories or clear your search query.
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {filteredProducts.map((product) => {
                  const pId = product._id || product.id;
                  const qty = getItemQuantity(pId);

                  return (
                    <HyperlocalProductCard
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

          {/* Partnered Local Dark Stores Strip */}
          <View className="mt-4 px-3.5 mb-2">
            <View className="bg-white rounded-2xl p-3 border border-[#E8E8E8] shadow-2xs">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-1.5">
                  <Icon name="storefront" size={16} color="#006948" />
                  <Text className="text-xs font-black text-[#1C1C1C]">
                    Partnered Wholesale Hubs
                  </Text>
                </View>
                <View className="bg-emerald-50 px-1.5 py-0.5 rounded">
                  <Text className="text-[10px] text-emerald-700 font-bold">Verified Plant</Text>
                </View>
              </View>

              <View className="border-t border-gray-100 pt-2 flex-row items-center justify-between">
                <View>
                  <Text className="text-xs font-bold text-[#1C1C1C]">RS Central Wholesale Hub</Text>
                  <Text className="text-[10px] text-[#888888]">Kanpur Factory Plant (0.8 km)</Text>
                </View>
                <View className="bg-[#EBF7EE] px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] font-black text-[#006948]">24-48H</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Docked Sticky Bottom Cart Bar */}
        <FloatingCartBar navigation={navigation} />
      </View>

      <LocationSelectorModal />
    </View>
  );
}
