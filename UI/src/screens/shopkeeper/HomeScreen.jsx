import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import RSLogo from '../../components/RSLogo';
import { ProductCardSkeleton, CategorySkeleton } from '../../components/Skeleton';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { getDefaultProductPricing } from '../../utils/productHelper';

export default function ShopkeeperHomeScreen({ navigation }) {
  const { items, addItem, removeItem, updateQuantity, totalAmount, itemCount } = useCartStore();
  const { session } = useAuthStore();
  const [dbProducts, setDbProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getCategories().catch(() => []),
      ]);
      setDbProducts(Array.isArray(prodRes) ? prodRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
    } catch (err) {
      console.error('[Home] Load error:', err.message);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    loadData().then(() => {
      if (isMounted) {
        setLoading(false);
      }
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

  const filteredProducts = search
    ? dbProducts.filter((p) => (p.name || p.title || '').toLowerCase().includes(search.toLowerCase()))
    : dbProducts;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Header Bar */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 shadow-sm z-10">
        <View className="flex-row items-center justify-between">
          <RSLogo size="md" />
          <View className="flex-row items-center gap-3">
            <TouchableOpacity activeOpacity={0.7} className="relative w-10 h-10 rounded-full bg-[#f2f3ff] justify-center items-center border border-[#dae2fd]">
              <Icon name="notifications-none" size={22} color="#3d4a42" />
              <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ba1a1a]" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full overflow-hidden border border-[#bccac0] justify-center items-center bg-[#f2f3ff]"
            >
              {session ? (
                <Image
                  source={{
                    uri: session.user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO2ijUAJMNwM-QODTNqSRCuJgJck70ZUjFztadUdQ6FY5QFQu1PRfZXrHv48QsDfm2odixXZVku1HckHrgpzBJXDjUuSQvqGsjB-N20z0l40gEeMYHfDd2UGxvKusUOYDZockQrFLPsfy6Mrv8tAG9ouXqm6-sobkEwc13Pinr0UynpcUjCcmLovh45QuDwt8IRv9A2Z1Yh6Uxjz6IeRLO0kDvVPUD7AcwYTdY6Ts-67cMaQugjx_D',
                  }}
                  className="w-full h-full"
                />
              ) : (
                <Icon name="person-outline" size={22} color="#006948" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#006948"
            colors={['#006948']}
          />
        }
      >
        {/* Search Bar */}
        <View className="px-4 pt-3 pb-2">
          <View className="flex-row items-center bg-white rounded-xl border border-[#bccac0]/40 px-3 h-12 shadow-sm">
            <Icon name="search" size={20} color="#006948" />
            <TextInput
              placeholder="Search RS Industries cleaning products..."
              placeholderTextColor="#6d7a72"
              value={search}
              onChangeText={setSearch}
              className="flex-1 h-full ml-2 text-xs text-[#131b2e]"
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                <Icon name="close" size={18} color="#6d7a72" />
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center gap-2">
                {/* <TouchableOpacity activeOpacity={0.7} className="w-8 h-8 rounded-full bg-[#f2f3ff] justify-center items-center">
                  <Icon name="mic" size={18} color="#3d4a42" />
                </TouchableOpacity> */}
                <TouchableOpacity activeOpacity={0.7} className="w-8 h-8 rounded-full bg-[#f2f3ff] justify-center items-center">
                  <Icon name="qr-code-scanner" size={18} color="#3d4a42" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Express Delivery Banner */}
        {/* <View className="px-4 pb-3">
          <View className="bg-[#99efe5] rounded-xl px-4 py-2.5 flex-row items-center justify-between shadow-sm border border-[#006f67]/20">
            <View className="flex-row items-center gap-2">
              <Icon name="bolt" size={18} color="#006f67" />
              <Text className="text-xs text-[#006f67] font-bold">
                Express Delivery in 25 mins
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-[#006f67]" />
              <Text className="text-[11px] text-[#006f67] font-semibold">Bulk Dispatch 24h</Text>
            </View>
          </View>
        </View> */}

        {/* Dynamic Shop by Category */}
        <View className="py-2">
          <View className="px-4 flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-1.5">
              <Icon name="category" size={18} color="#006948" />
              <Text className="text-base text-[#131b2e] font-bold">Shop by Category</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Catalog')} activeOpacity={0.7} className="flex-row items-center">
              <Text className="text-xs text-[#006948] font-bold">See All</Text>
              <Icon name="chevron-right" size={16} color="#006948" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator={false} className="pl-4">
            {loading ? (
              <>
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
              </>
            ) : (
              categories.map((cat, idx) => (
                <TouchableOpacity
                  key={cat._id || cat.slug || idx}
                  activeOpacity={0.7}
                  delayPressIn={0}
                  className="items-center mr-4 w-[74px]"
                  onPress={() => navigation.navigate('Catalog', { categoryId: cat.slug || cat._id || cat.name })}
                >
                  <View className="w-16 h-16 rounded-2xl bg-white p-2 shadow-sm justify-center items-center mb-1.5 border border-[#eaedff]">
                    {cat.img || cat.image || cat.iconUrl ? (
                      <Image source={{ uri: cat.img || cat.image || cat.iconUrl }} className="w-full h-full" resizeMode="contain" />
                    ) : (
                      <Icon name={cat.icon || 'cleaning-services'} size={28} color="#006948" />
                    )}
                  </View>
                  <Text className="text-[11px] text-[#131b2e] text-center font-medium leading-tight" numberOfLines={2}>
                    {cat.name || cat.title}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Dynamic Products Showcase */}
        {loading ? (
          <View className="px-4 py-3">
            <View className="flex-row flex-wrap justify-between gap-y-3">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </View>
          </View>
        ) : (
          <>
            {/* Best Sellers Section */}
            <View className="pt-4 pb-2">
              <View className="px-4 flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-1.5">
                  <Icon name="stars" size={20} color="#006948" />
                  <Text className="text-base text-[#131b2e] font-bold">Best Sellers</Text>
                </View>
                <Text className="text-xs text-[#3d4a42] font-semibold">Top Rated</Text>
              </View>

              <ScrollView horizontal keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator={false} className="pl-4">
                {filteredProducts.slice(0, 6).map((product) => {
                  const pId = product._id || product.id;
                  const qty = getItemQuantity(pId);
                  return (
                    <View
                      key={pId}
                      className="w-[200px] bg-white rounded-2xl p-3 mr-3 shadow-sm justify-between border border-[#eaedff]"
                    >
                      <TouchableOpacity
                        activeOpacity={0.7}
                        delayPressIn={0}
                        onPress={() => navigation.navigate('ProductDetail', { product })}
                      >
                        <View className="relative w-full h-32 rounded-xl bg-[#f2f3ff] justify-center items-center p-2 mb-2 overflow-hidden border border-[#eaedff]">
                          <Image
                            source={{ uri: product.image }}
                            className="w-full h-full"
                            resizeMode="contain"
                          />
                          {product.badge && (
                            <View className="absolute top-2 left-2 z-10 bg-[#85f8c4] px-1.5 py-0.5 rounded shadow-sm">
                              <Text className="text-[10px] text-[#002114] font-bold">{product.badge}</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs font-bold text-[#131b2e]" numberOfLines={1}>
                          {product.name}
                        </Text>
                        <Text className="text-[11px] text-[#3d4a42]" numberOfLines={1}>
                          {product.subtitle || product.category}
                        </Text>
                      </TouchableOpacity>

                      <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-[#f2f3ff]">
                        <View className="flex-row items-baseline gap-1">
                          <Text className="text-base font-extrabold text-[#131b2e]">₹{product.price}</Text>
                          {product.mrp && <Text className="text-[10px] text-[#6d7a72] line-through">₹{product.mrp}</Text>}
                        </View>

                        {qty === 0 ? (
                          <TouchableOpacity
                            onPress={() => handleUpdateQty(product, 1)}
                            activeOpacity={0.7}
                            delayPressIn={0}
                            className="h-8 px-3 bg-[#faf8ff] border border-[#006948] rounded-lg flex-row items-center gap-1"
                          >
                            <Text className="text-xs text-[#006948] font-bold">ADD</Text>
                            <Icon name="add" size={14} color="#006948" />
                          </TouchableOpacity>
                        ) : (
                          <View className="h-8 bg-[#006948] rounded-lg flex-row items-center px-1">
                            <TouchableOpacity
                              onPress={() => handleUpdateQty(product, -1)}
                              activeOpacity={0.7}
                              className="w-6 h-full justify-center items-center"
                            >
                              <Icon name="remove" size={14} color="#ffffff" />
                            </TouchableOpacity>
                            <Text className="px-2 text-xs font-bold text-white">{qty}</Text>
                            <TouchableOpacity
                              onPress={() => handleUpdateQty(product, 1)}
                              activeOpacity={0.7}
                              className="w-6 h-full justify-center items-center"
                            >
                              <Icon name="add" size={14} color="#ffffff" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {/* Commercial & Household Products 2-Column Grid */}
            <View className="px-4 py-3">
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-base font-bold text-[#131b2e]">Commercial & Household Products</Text>
                  <Text className="text-xs text-[#3d4a42]">Certified safety formulations for all spaces</Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} className="w-8 h-8 rounded-lg bg-[#e2e7ff] justify-center items-center">
                  <Icon name="tune" size={18} color="#131b2e" />
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap justify-between gap-y-3">
                {filteredProducts.map((product) => {
                  const pId = product._id || product.id;
                  const qty = getItemQuantity(pId);
                  const defaultInfo = getDefaultProductPricing(product);
                  const displayPrice = defaultInfo.price || product.price || 0;
                  const displayMrp = defaultInfo.mrp || product.mrp || 0;
                  const variantSubtitle = defaultInfo.variantLabel || product.subtitle || product.category;
                  const bundleTag = defaultInfo.bundleLabel;

                  return (
                    <View
                      key={pId}
                      className="w-[48.5%] bg-white rounded-2xl p-3 shadow-sm justify-between border border-[#eaedff]"
                    >
                      <View>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          delayPressIn={0}
                          onPress={() => navigation.navigate('ProductDetail', { product })}
                        >
                          <View className="relative w-full h-28 rounded-xl bg-[#f2f3ff] justify-center items-center p-2 mb-2 overflow-hidden border border-[#eaedff]">
                            <Image
                              source={{ uri: defaultInfo.image || product.image }}
                              className="w-full h-full"
                              resizeMode="contain"
                            />
                            {product.badge && (
                              <View className="absolute top-1.5 left-1.5 z-10 bg-[#9cf2e8] px-1.5 py-0.5 rounded shadow-sm">
                                <Text className="text-[9px] text-[#00201d] font-bold">{product.badge}</Text>
                              </View>
                            )}
                            {bundleTag ? (
                              <View className="absolute bottom-1.5 right-1.5 z-10 bg-[#006948] px-1.5 py-0.5 rounded shadow-sm">
                                <Text className="text-[8px] text-white font-bold">{bundleTag}</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text className="text-xs font-bold text-[#131b2e]" numberOfLines={1}>
                            {product.name}
                          </Text>
                          <Text className="text-[10px] text-[#006948] font-semibold" numberOfLines={1}>
                            {variantSubtitle}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-[#f2f3ff]">
                        <View className="flex-row items-baseline gap-1">
                          <Text className="text-sm font-extrabold text-[#131b2e]">₹{displayPrice}</Text>
                          {displayMrp > displayPrice && (
                            <Text className="text-[9px] text-[#6d7a72] line-through">₹{displayMrp}</Text>
                          )}
                        </View>

                        <TouchableOpacity
                          onPress={() => handleUpdateQty(product, 1)}
                          activeOpacity={0.7}
                          delayPressIn={0}
                          className="h-7 px-2.5 bg-[#006948] rounded-lg justify-center items-center shadow-sm"
                        >
                          <Text className="text-[10px] text-white font-bold">
                            {qty > 0 ? `ADD (${qty})` : 'ADD'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* Custom Enterprise Barrels Card */}
        <View className="px-4 pt-2 pb-6">
          <TouchableOpacity
            onPress={() => navigation.navigate('Catalog')}
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center gap-3 border border-[#eaedff]"
          >
            <View className="w-12 h-12 rounded-xl bg-[#99efe5] justify-center items-center">
              <Icon name="request-quote" size={24} color="#006f67" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#131b2e]">Need Custom Enterprise Barrels?</Text>
              <Text className="text-[11px] text-[#3d4a42]">
                Procure up to 200L drums with certified GST invoice
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color="#3d4a42" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Cart Dock */}
      {itemCount() > 0 && (
        <View className="absolute bottom-4 left-4 right-4 z-40">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Cart')}
            className="bg-[#006948] rounded-2xl p-3 shadow-xl flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-xl bg-white/15 justify-center items-center">
                <FeatherIcon name="shopping-bag" size={18} color="#ffffff" />
              </View>
              <View>
                <Text className="text-xs font-bold text-white">
                  {itemCount()} {itemCount() === 1 ? 'item' : 'items'} • ₹{totalAmount().toLocaleString('en-IN')}
                </Text>
                <Text className="text-[10px] text-[#68dba9]">GST invoice included</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1 pl-3">
              <Text className="text-xs font-bold text-white">View Cart</Text>
              <Icon name="arrow-forward" size={18} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
