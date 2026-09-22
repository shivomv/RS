import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { CategoryItemSkeleton, ProductCardSkeleton } from '../../components/Skeleton';
import { getDefaultProductPricing } from '../../utils/productHelper';

export default function CatalogScreen({ navigation, route }) {
  const initialCategory = route?.params?.categoryId;
  const { addItem, updateQuantity, items } = useCartStore();
  const { session } = useAuthStore();

  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Reload categories
      const catRes = await api.getCategories();
      const catList = Array.isArray(catRes) ? catRes : [];
      setCategories(catList);

      // Reload products for current category
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

  // Hardware Back Press
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

  // Load Categories
  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await api.getCategories();
        const list = Array.isArray(res) ? res : [];

        if (!mounted) return;
        setCategories(list);

        if (list.length > 0) {
          if (initialCategory) {
            const found = list.find(
              (cat) =>
                String(cat._id) === String(initialCategory) ||
                String(cat.slug).toLowerCase() === String(initialCategory).toLowerCase() ||
                String(cat.name).toLowerCase() === String(initialCategory).toLowerCase()
            );
            setSelectedCat(found || list[0]);
          } else {
            setSelectedCat(list[0]);
          }
        }
      } catch (error) {
        console.warn('[Catalog] Category error:', error?.message);
      } finally {
        if (mounted) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, [initialCategory]);

  // Load Products for selected category
  useEffect(() => {
    if (!selectedCat) {
      setProducts([]);
      return;
    }

    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const catId = selectedCat._id || selectedCat.slug || selectedCat.name;
        const res = await api.getProductsByCategory(catId);

        if (!mounted) return;
        setProducts(Array.isArray(res) ? res : []);
      } catch (error) {
        console.warn('[Catalog] Product error:', error?.message);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [selectedCat]);

  const handleCategoryPress = useCallback((category) => {
    setSelectedCat(category);
  }, []);

  const handleProductPress = useCallback((product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  // Ensure grid of 2 even when odd number of products (e.g. 1 product)
  const gridProductsData = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    if (products.length % 2 !== 0) {
      return [...products, { _id: '__spacer__', isSpacer: true }];
    }
    return products;
  }, [products]);

  // Helper to check quantity in cart
  const getItemQuantityInCart = useCallback(
    (product) => {
      const defaultInfo = getDefaultProductPricing(product);
      const defaultBundle = defaultInfo.bundle || product.defaultBundle || {};
      const bundleId = defaultBundle.bundleId || 'pack-1';
      const cartItemId = `${product._id}_${bundleId}`;

      const existing = items.find((i) => i.cartItemId === cartItemId || i._id === product._id);
      return existing ? existing.quantity : 0;
    },
    [items]
  );

  const renderProductCard = ({ item }) => {
    // If spacer item for odd row alignment, render invisible 50% width box
    if (item.isSpacer) {
      return <View className="flex-1 mx-1 mb-2.5" />;
    }

    const defaultInfo = getDefaultProductPricing(item);
    const displayPrice = defaultInfo.price || item.price || 0;
    const displayMrp = defaultInfo.mrp || item.mrp || 0;
    const variantSubtitle = defaultInfo.variantLabel || item.subtitle || item.category;
    const bundleTag = defaultInfo.bundleLabel;
    const imageUri = defaultInfo.image || item.image || item.img;
    const inCartQty = getItemQuantityInCart(item);

    return (
      <View
        className="flex-1 bg-white rounded-2xl border border-[#e2e7e3] overflow-hidden justify-between mx-1 mb-2.5 shadow-sm"
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleProductPress(item)}
          className="flex-1"
        >
          {/* Product Image Box */}
          <View className="relative h-28 bg-[#f5f7f6] items-center justify-center p-1.5">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : (
              <Icon name="inventory-2" size={36} color="#9aa59f" />
            )}

            {item.badge && (
              <View className="absolute top-1.5 left-1.5 z-10 bg-[#006948] px-1.5 py-0.5 rounded shadow-sm">
                <Text className="text-[8px] font-bold text-white uppercase">{item.badge}</Text>
              </View>
            )}

            {bundleTag ? (
              <View className="absolute bottom-1.5 right-1.5 z-10 bg-[#006948]/10 px-1.5 py-0.5 rounded border border-[#006948]/30">
                <Text className="text-[8px] font-bold text-[#006948]">{bundleTag}</Text>
              </View>
            ) : null}
          </View>

          {/* Product Details */}
          <View className="p-2.5 flex-1 justify-between">
            <View>
              <Text className="text-[11px] font-black text-[#131b2e] leading-snug" numberOfLines={2}>
                {item.name || item.title || 'Product'}
              </Text>
              <Text className="text-[9px] font-semibold text-[#006948] mt-0.5" numberOfLines={1}>
                {variantSubtitle}
              </Text>
            </View>

            {/* Price & Add to Cart */}
            <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-[#f2f3ff]">
              <View>
                <Text className="text-xs font-black text-[#131b2e]">₹{displayPrice}</Text>
                {displayMrp > displayPrice && (
                  <Text className="text-[8px] text-[#6d7a72] line-through">₹{displayMrp}</Text>
                )}
              </View>

              {inCartQty > 0 ? (
                <View className="h-7 bg-[#006948] rounded-lg flex-row items-center px-1">
                  <TouchableOpacity
                    onPress={() => updateQuantity(item._id, inCartQty - 1)}
                    activeOpacity={0.7}
                    className="w-5 h-full justify-center items-center"
                  >
                    <Icon name="remove" size={12} color="#ffffff" />
                  </TouchableOpacity>
                  <Text className="px-1 text-[10px] font-bold text-white">{inCartQty}</Text>
                  <TouchableOpacity
                    onPress={() => addItem(item)}
                    activeOpacity={0.7}
                    className="w-5 h-full justify-center items-center"
                  >
                    <Icon name="add" size={12} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => addItem(item)}
                  activeOpacity={0.7}
                  className="h-7 px-2.5 bg-[#006948] rounded-lg justify-center items-center shadow-sm"
                >
                  <Text className="text-[9.5px] text-white font-bold">ADD</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-[#e2e7e3] shadow-sm z-10">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('ShopHome');
                }
              }}
              className="w-9 h-9 rounded-full bg-[#f3f5f4] items-center justify-center border border-[#e2e7e3]"
            >
              <Icon name="arrow-back" size={20} color="#131b2e" />
            </TouchableOpacity>

            <View className="ml-1">
              <Text className="text-base font-black text-[#131b2e]">Product Catalog</Text>
              <Text className="text-[9.5px] text-[#6d7a72] font-semibold">
                Shop by category & variants
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main Body */}
      <View className="flex-1 flex-row">
        {/* Left Category Sidebar (Sidenav) */}
        <View className="w-[28%] bg-white border-r border-[#e2e7e3]">
          {loadingCategories ? (
            <View className="py-2">
              <CategoryItemSkeleton />
              <CategoryItemSkeleton />
              <CategoryItemSkeleton />
              <CategoryItemSkeleton />
              <CategoryItemSkeleton />
            </View>
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item, index) => String(item._id || item.slug || `category-${index}`)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 6 }}
              renderItem={({ item }) => {
                const isSelected =
                  selectedCat &&
                  (String(selectedCat._id) === String(item._id) ||
                    String(selectedCat.slug) === String(item.slug));

                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleCategoryPress(item)}
                    className={`relative py-3.5 px-2 items-center border-b border-[#f0f3f1] ${
                      isSelected ? 'bg-[#006948]/10' : 'bg-white'
                    }`}
                  >
                    {isSelected && (
                      <View className="absolute left-0 top-0 bottom-0 w-1 bg-[#006948] rounded-r" />
                    )}

                    <View
                      className={`w-11 h-11 rounded-xl items-center justify-center overflow-hidden ${
                        isSelected ? 'bg-[#006948]/15 border border-[#006948]/30' : 'bg-[#f3f5f4] border border-[#e2e7e3]/60'
                      }`}
                    >
                      {item.image || item.img ? (
                        <Image
                          source={{ uri: item.image || item.img }}
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      ) : (
                        <Icon
                          name={item.icon || 'cleaning-services'}
                          size={22}
                          color={isSelected ? '#006948' : '#3d4a42'}
                        />
                      )}
                    </View>

                    <Text
                      className={`text-[9.5px] text-center mt-1.5 font-bold ${
                        isSelected ? 'text-[#006948]' : 'text-[#4f5b55]'
                      }`}
                      numberOfLines={2}
                    >
                      {item.name || item.title || 'Category'}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {/* Right Product Grid Area */}
        <View className="flex-1 p-2">
          {/* Active Category Header */}
          <View className="px-2 pt-1 pb-2 flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-black text-[#131b2e]" numberOfLines={1}>
                {selectedCat?.name || selectedCat?.title || 'Products'}
              </Text>
              <Text className="text-[9.5px] text-[#6d7a72] font-semibold mt-0.5">
                {products.length} {products.length === 1 ? 'Item' : 'Items'} Available
              </Text>
            </View>
          </View>

          {/* Product Cards Loading (Skeletons instead of Spinners) */}
          {loadingProducts ? (
            <View className="flex-row flex-wrap justify-between p-1">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </View>
          ) : (
            <FlatList
              data={gridProductsData}
              numColumns={2}
              keyExtractor={(item, index) => String(item._id || item.slug || `product-${index}`)}
              renderItem={renderProductCard}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#006948"
                  colors={['#006948']}
                />
              }
              ListEmptyComponent={
                <View className="items-center justify-center py-16 px-4 bg-[#f8fafc] rounded-2xl border border-dashed border-[#bccac0] mt-3">
                  <Icon name="inventory-2" size={36} color="#9aa59f" />
                  <Text className="text-xs font-bold text-[#131b2e] mt-2">No products found</Text>
                  <Text className="text-[10px] text-[#6d7a72] text-center mt-0.5">
                    There are no products available in this category.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}