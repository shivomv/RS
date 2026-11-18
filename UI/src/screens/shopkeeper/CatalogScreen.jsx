import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import LocationHeaderPill from '../../components/LocationHeaderPill';
import LocationSelectorModal from '../../components/LocationSelectorModal';
import FloatingCartBar from '../../components/FloatingCartBar';
import HyperlocalProductCard from '../../components/HyperlocalProductCard';
import { CategoryItemSkeleton, ProductCardSkeleton } from '../../components/Skeleton';

export default function CatalogScreen({ navigation, route }) {
  const initialCategory = route?.params?.categoryId;
  const { addItem, updateQuantity, removeItem, items, itemCount } = useCartStore();

  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const catRes = await api.getCategories();
      const catList = Array.isArray(catRes) ? catRes : [];
      setCategories(catList);

      if (selectedCat) {
        const catId = selectedCat._id || selectedCat.slug || selectedCat.name;
        const prodRes = await api.getProductsByCategory(catId);
        setProducts(Array.isArray(prodRes) ? prodRes : []);
      }
    } catch (err) {
      console.error('[Catalog] Refresh error:', err.message);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCat]);

  // Back Navigation
  useEffect(() => {
    const onBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      navigation.navigate('ShopHome');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [navigation]);

  // Load Categories on mount
  useEffect(() => {
    let mounted = true;
    const fetchCats = async () => {
      try {
        setLoadingCategories(true);
        const res = await api.getCategories();
        const list = Array.isArray(res) ? res : [];
        if (mounted) {
          setCategories(list);
          if (initialCategory) {
            const found = list.find(
              (cat) =>
                String(cat._id) === String(initialCategory) ||
                String(cat.slug).toLowerCase() === String(initialCategory).toLowerCase() ||
                String(cat.name).toLowerCase() === String(initialCategory).toLowerCase()
            );
            setSelectedCat(found || list[0]);
          } else if (list.length > 0) {
            setSelectedCat(list[0]);
          }
        }
      } catch (error) {
        console.warn('[Catalog] Category load error:', error?.message);
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    };
    fetchCats();
    return () => {
      mounted = false;
    };
  }, [initialCategory]);

  // Load Products for selected category
  useEffect(() => {
    if (!selectedCat) return;
    let mounted = true;
    const fetchProds = async () => {
      try {
        setLoadingProducts(true);
        const catId = selectedCat._id || selectedCat.slug || selectedCat.name;
        const res = await api.getProductsByCategory(catId);
        if (mounted) setProducts(Array.isArray(res) ? res : []);
      } catch (err) {
        console.warn('[Catalog] Products load error:', err.message);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };
    fetchProds();
    return () => {
      mounted = false;
    };
  }, [selectedCat]);

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

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Bar for Aisles */}
      <View className="px-4 py-2.5 bg-white border-b border-[#E8E8E8] flex-row items-center justify-between shadow-xs">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-[#006948] justify-center items-center">
            <Icon name="grid-view" size={18} color="#ffffff" />
          </View>
          <View>
            <Text className="text-sm font-black text-[#1C1C1C]">All Categories</Text>
            <Text className="text-[10px] text-[#666666] font-medium">Fast Aisle Navigation</Text>
          </View>
        </View>
        <LocationHeaderPill />
      </View>

      {/* 2-Panel View */}
      <View className="flex-1 flex-row relative">
        {/* Left Category Sidebar (26% width) */}
        <View className="w-[26%] bg-[#F4F6FB] border-r border-[#E8E8E8]">
          {loadingCategories ? (
            <View className="p-2">
              <CategoryItemSkeleton />
              <CategoryItemSkeleton />
              <CategoryItemSkeleton />
            </View>
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item, index) => String(item._id || index)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedCat && (selectedCat._id === item._id || selectedCat.name === item.name);

                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setSelectedCat(item)}
                    className={`py-3.5 px-1.5 items-center border-b border-[#E8E8E8]/60 relative ${
                      isSelected ? 'bg-white' : 'bg-transparent'
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isSelected && (
                      <View className="absolute left-0 top-0 bottom-0 w-1 bg-[#006948] rounded-r" />
                    )}

                    <View
                      className={`w-11 h-11 rounded-2xl justify-center items-center mb-1 overflow-hidden ${
                        isSelected
                          ? 'bg-[#EBF7EE] border border-[#006948]/30'
                          : 'bg-white border border-[#E8E8E8]'
                      }`}
                    >
                      {item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Icon
                          name="cleaning-services"
                          size={20}
                          color={isSelected ? '#006948' : '#666666'}
                        />
                      )}
                    </View>

                    <Text
                      className={`text-[10px] text-center font-bold leading-3.5 ${
                        isSelected ? 'text-[#006948]' : 'text-[#475569]'
                      }`}
                      numberOfLines={2}
                    >
                      {item.name || item.title}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {/* Right Products Panel (74% width) with 2 Products per Grid Row */}
        <View className="flex-1 bg-[#F4F6FB]">
          {/* Active Category Header */}
          <View className="px-3 py-2 bg-white border-b border-[#E8E8E8] flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-black text-[#1C1C1C]" numberOfLines={1}>
                {selectedCat?.name || 'Selected Category'}
              </Text>
              <Text className="text-[10px] text-[#666666]">
                {products.length} {products.length === 1 ? 'item' : 'items'} available
              </Text>
            </View>
            <View className="bg-[#EBF7EE] px-2 py-0.5 rounded">
              <Text className="text-[9px] font-black text-[#006948]">⚡ 24h Express</Text>
            </View>
          </View>

          {loadingProducts ? (
            <View className="p-3">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </View>
          ) : products.length === 0 ? (
            <View className="flex-1 justify-center items-center p-6">
              <Icon name="inventory-2" size={40} color="#94a3b8" />
              <Text className="text-xs font-black text-[#1C1C1C] mt-2">No Items in this Category</Text>
              <Text className="text-[10px] text-[#666666] text-center mt-1">
                Please select another category from the left.
              </Text>
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item, index) => String(item._id || index)}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 6 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 8,
                paddingBottom: itemCount() > 0 ? 80 : 30,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#006948"
                />
              }
              renderItem={({ item }) => {
                const pId = item._id || item.id;
                const qty = getItemQuantity(pId);

                return (
                  <HyperlocalProductCard
                    product={item}
                    quantity={qty}
                    fullWidth={false}
                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                    onAdd={() => handleUpdateQty(item, 1)}
                    onIncrement={() => handleUpdateQty(item, 1)}
                    onDecrement={() => handleUpdateQty(item, -1)}
                  />
                );
              }}
            />
          )}
        </View>

        {/* Floating Cart Strip */}
        <FloatingCartBar navigation={navigation} />
      </View>

      <LocationSelectorModal />
    </SafeAreaView>
  );
}
