import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { ProductCardSkeleton } from '../../components/Skeleton';
import { useCartStore } from '../../store/cartStore';
import { api } from '../../services/api';

// Safe helper to extract category name/slug/id
const getCategoryName = (c) => {
  if (!c) return '';
  if (typeof c === 'string') return c;
  if (typeof c === 'object') return c.name || c.title || c.slug || c._id || '';
  return String(c);
};

export default function CatalogScreen({ navigation, route }) {
  const { addItem } = useCartStore();

  const routeCat = route?.params?.categoryId;
  const initialCategory = (routeCat && String(routeCat).trim().toUpperCase() !== 'ALL')
    ? String(routeCat).trim()
    : '';

  // 1. ALL useState hooks declared FIRST at top level (Strict React Rules of Hooks)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. ALL useMemo hooks declared NEXT
  const categoryList = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    return categories.map((c, idx) => {
      const name = getCategoryName(c);
      const catKey = c.slug || c._id || name;
      return {
        id: catKey,
        title: name,
        icon: c.icon || 'cleaning-services',
        img: c.img || c.image || c.iconUrl,
        slug: c.slug || `cat-${idx}`,
      };
    });
  }, [categories]);

  const activeCategoryTitle = useMemo(() => {
    if (!selectedCategory) return 'Products';
    const found = categoryList.find(
      (c) => String(c.id).toLowerCase() === String(selectedCategory).toLowerCase()
    );
    return found?.title || selectedCategory;
  }, [selectedCategory, categoryList]);

  // 3. ALL useCallback hooks declared NEXT
  const handleSelectCategory = useCallback(
    (catId) => {
      if (catId && catId !== selectedCategory) {
        setSelectedCategory(catId);
      }
    },
    [selectedCategory]
  );

  // 4. ALL useEffect hooks declared FINALLY
  useEffect(() => {
    if (routeCat && String(routeCat).trim().toUpperCase() !== 'ALL') {
      const cleanCat = String(routeCat).trim();
      setSelectedCategory(cleanCat);
    }
  }, [routeCat]);

  useEffect(() => {
    const onBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      navigation.navigate('ShopHome');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);

  useEffect(() => {
    let isMounted = true;
    api.getCategories()
      .then((catData) => {
        if (isMounted && Array.isArray(catData) && catData.length > 0) {
          setCategories(catData);
          const firstKey = catData[0].slug || catData[0]._id || (typeof catData[0] === 'string' ? catData[0] : catData[0].name);
          if (firstKey) {
            setSelectedCategory((curr) => curr || firstKey);
          }
        }
      })
      .catch((err) => {
        console.warn('[CatalogScreen] Categories load notice:', err?.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    let isMounted = true;
    setLoading(true);

    const targetCat = getCategoryName(selectedCategory).trim();

    api.getProducts(targetCat)
      .then((prodData) => {
        if (isMounted) {
          setProducts(Array.isArray(prodData) ? prodData : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('[CatalogScreen] Products fetch notice:', err?.message);
        if (isMounted) {
          setProducts([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Top Header with Navigation & Logo */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 shadow-sm z-10">
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
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              className="w-9 h-9 rounded-full bg-[#f2f3ff] items-center justify-center border border-[#dae2fd]"
            >
              <Icon name="arrow-back" size={20} color="#131b2e" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ShopHome')}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#006948]/10 border border-[#006948]/20"
            >
              <Icon name="home" size={16} color="#006948" />
              <Text className="text-xs font-bold text-[#006948]">Home</Text>
            </TouchableOpacity>

            <RSLogo size="md" />
          </View>
        </View>
      </View>

      {/* Main Split Layout: Left Category Sidebar + Right Product Grid */}
      <View className="flex-1 flex-row">
        {/* Left Side Panel (Category Filter List) */}
        <View className="w-[88px] bg-[#f2f3ff] border-r border-[#dae2fd]">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 6 }}
          >
            {categoryList.map((cat) => {
              const isSelected =
                String(selectedCategory).trim().toLowerCase() === String(cat.id).trim().toLowerCase();
              return (
                <TouchableOpacity
                  key={String(cat.id)}
                  onPress={() => handleSelectCategory(cat.id)}
                  activeOpacity={0.7}
                  delayPressIn={0}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  className={`relative py-3 px-1 items-center justify-center border-b border-[#eaedff] ${
                    isSelected ? 'bg-white shadow-sm' : 'bg-transparent'
                  }`}
                >
                  {isSelected && (
                    <View className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#006948] rounded-r-md" />
                  )}
                  <View
                    className={`w-10 h-10 rounded-xl items-center justify-center mb-1 overflow-hidden ${
                      isSelected ? 'bg-[#006948]/10 border border-[#006948]/30' : 'bg-white/80'
                    }`}
                  >
                    {cat.img || cat.image ? (
                      <Image
                        source={{ uri: cat.img || cat.image }}
                        className="w-full h-full rounded-md"
                        resizeMode="contain"
                      />
                    ) : (
                      <Icon
                        name={cat.icon || 'cleaning-services'}
                        size={20}
                        color={isSelected ? '#006948' : '#6d7a72'}
                      />
                    )}
                  </View>
                  <Text
                    numberOfLines={2}
                    className={`text-[9.5px] text-center leading-tight ${
                      isSelected ? 'text-[#006948] font-bold' : 'text-[#3d4a42] font-semibold'
                    }`}
                  >
                    {cat.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Main Panel (Pure Database-Driven Category Grid) */}
        <View className="flex-1 bg-[#faf8ff]">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          >
            {/* Category Header */}
            <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-[#dae2fd]">
              <View className="flex-1 pr-2">
                <Text className="text-xs font-black text-[#131b2e]" numberOfLines={1}>
                  {activeCategoryTitle}
                </Text>
                <Text className="text-[10px] text-[#6d7a72] font-semibold mt-0.5">
                  {products.length} {products.length === 1 ? 'Product Available' : 'Products Available'}
                </Text>
              </View>
            </View>

            {/* Product Cards or Loading Skeleton */}
            {loading ? (
              <View className="flex-row flex-wrap justify-between gap-y-3">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </View>
            ) : products.length > 0 ? (
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {products.map((item, idx) => (
                  <ProductCard
                    key={item._id || item.id || `prod-${idx}`}
                    item={item}
                    navigation={navigation}
                    addItem={addItem}
                  />
                ))}
              </View>
            ) : (
              <View className="py-12 bg-white/60 rounded-2xl items-center justify-center border border-dashed border-[#bccac0]/50 mt-4">
                <Icon name="inventory" size={32} color="#6d7a72" />
                <Text className="text-xs text-[#131b2e] font-bold mt-2">
                  No products in this category
                </Text>
                <Text className="text-[10px] text-[#6d7a72] mt-0.5">
                  Select another category from the left menu.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Reusable Touch-Responsive Product Card Component (Memoized)
const ProductCard = React.memo(function ProductCard({ item, navigation, addItem }) {
  const imageUri = item?.image || item?.imageUrl || item?.img;

  return (
    <View className="w-[48.5%] bg-white rounded-xl p-2.5 shadow-sm justify-between border border-[#eaedff]">
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        activeOpacity={0.7}
        delayPressIn={0}
      >
        <View className="relative w-full h-24 rounded-lg bg-[#f2f3ff] justify-center items-center p-1.5 mb-1.5 overflow-hidden border border-[#eaedff]/60">
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="contain" />
          ) : (
            <Icon name="inventory-2" size={36} color="#bccac0" />
          )}
          {item?.badge && (
            <View className="absolute top-1 left-1 z-10 bg-[#85f8c4] px-1.5 py-0.5 rounded shadow-sm">
              <Text className="text-[8px] text-[#002114] font-bold">{item.badge}</Text>
            </View>
          )}
        </View>
        <Text className="text-[11px] font-bold text-[#131b2e]" numberOfLines={1}>
          {item?.name || item?.title || 'Unnamed Product'}
        </Text>
        <Text className="text-[9px] text-[#3d4a42]" numberOfLines={1}>
          {item?.subtitle || item?.description || ''}
        </Text>
      </TouchableOpacity>

      <View className="flex-row items-center justify-between mt-2 pt-1.5 border-t border-[#f2f3ff]">
        <View className="flex-row items-baseline gap-0.5">
          <Text className="text-xs font-extrabold text-[#131b2e]">₹{item?.price || 0}</Text>
          {item?.mrp && <Text className="text-[8px] text-[#6d7a72] line-through">₹{item.mrp}</Text>}
        </View>
        <TouchableOpacity
          onPress={() => addItem({ ...item, quantity: 1 })}
          activeOpacity={0.7}
          delayPressIn={0}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="h-6 px-2.5 bg-[#006948] rounded-md justify-center items-center shadow-sm"
        >
          <Text className="text-[9px] text-white font-bold">ADD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
