import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
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

// Safe helper to extract string category name from string or object
const getCategoryName = (c) => {
  if (!c) return '';
  if (typeof c === 'string') return c;
  if (typeof c === 'object') return c.name || c.title || c.slug || c._id || '';
  return String(c);
};

export default function CatalogScreen({ navigation, route }) {
  const { addItem } = useCartStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.categoryId || 'ALL');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardware Android Back Button Handler
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

  // Default fallbacks if categories DB is empty
  const defaultCategories = [
    { id: 'ALL', title: 'All Products', icon: 'border-all' },
    { id: 'Floor Cleaners', title: 'Floor Cleaners', icon: 'cleaning-services' },
    { id: 'Disinfectants', title: 'Disinfectants', icon: 'sanitizer' },
    { id: 'Dishwash & Degreaser', title: 'Dishwash & Degreaser', icon: 'flatware' },
    { id: 'Glass & Surface', title: 'Glass & Surface', icon: 'window' },
    { id: 'Handwash', title: 'Handwash', icon: 'wash' },
    { id: 'Bulk Drums', title: 'Bulk Drums', icon: 'inventory-2' },
  ];

  // Sync route param category selection if present
  useEffect(() => {
    if (route?.params?.categoryId) {
      setSelectedCategory(route.params.categoryId);
    }
  }, [route?.params?.categoryId]);

  // Fetch Category taxonomy list on mount
  useEffect(() => {
    let isMounted = true;
    api.getCategories()
      .then((catData) => {
        if (isMounted && Array.isArray(catData)) {
          setCategories(catData);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // Fetch Products strictly category-wise from Backend Database
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const targetCat = getCategoryName(selectedCategory).trim();
    const catParam = (targetCat && targetCat.toUpperCase() !== 'ALL') ? targetCat : '';

    api.getProducts(catParam, search)
      .then((prodData) => {
        if (isMounted) {
          setProducts(Array.isArray(prodData) ? prodData : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProducts([]);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [selectedCategory, search]);

  // Memoized safe category list
  const categoryList = useMemo(() => {
    const list = [{ id: 'ALL', title: 'All Products', icon: 'border-all' }];

    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach((c, idx) => {
        const name = getCategoryName(c);
        if (name) {
          list.push({
            id: name,
            title: name,
            icon: c.icon || 'cleaning-services',
            img: c.img || c.image || c.iconUrl,
            slug: c.slug || `cat-${idx}`,
          });
        }
      });
    } else {
      defaultCategories.forEach((c) => {
        if (c.id !== 'ALL') list.push(c);
      });
    }

    return list;
  }, [categories]);

  // Products returned directly from category-wise backend API
  const displayedProducts = products;

  const handleSelectCategory = useCallback((catId) => {
    setSelectedCategory(catId);
    if (search) setSearch('');
  }, [search]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Top Header with Navigation & Logo */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 shadow-sm z-10">
        <View className="flex-row items-center justify-between mb-2.5">
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

          <TouchableOpacity
            onPress={() => navigation.navigate('BulkPriceOptimizer')}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="flex-row items-center gap-1 bg-[#006948]/10 px-2.5 py-1.5 rounded-full border border-[#006948]/20"
          >
            <Icon name="calculate" size={16} color="#006948" />
            <Text className="text-xs text-[#006948] font-bold">Bulk Calc</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View className="flex-row items-center bg-[#f2f3ff] rounded-xl px-3 h-10 border border-[#dae2fd]">
          <Icon name="search" size={18} color="#006948" />
          <TextInput
            placeholder="Search RS Industries catalog..."
            placeholderTextColor="#6d7a72"
            value={search}
            onChangeText={setSearch}
            className="flex-1 h-full ml-2 text-xs text-[#131b2e]"
          />
          {search ? (
            <TouchableOpacity
              onPress={() => setSearch('')}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={16} color="#6d7a72" />
            </TouchableOpacity>
          ) : null}
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
              const isSelected = String(selectedCategory).trim().toLowerCase() === String(cat.id).trim().toLowerCase();
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
                      <Image source={{ uri: cat.img || cat.image }} className="w-full h-full rounded-md" resizeMode="contain" />
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

        {/* Right Main Panel (Filtered Products Grid) */}
        <View className="flex-1 bg-[#faf8ff]">
          {loading ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
            >
              <View className="flex-row flex-wrap justify-between gap-y-3">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </View>
            </ScrollView>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
            >
              {/* Active Category Title & Count Header */}
              <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-[#dae2fd]">
                <View className="flex-1 pr-2">
                  <Text className="text-xs font-black text-[#131b2e]" numberOfLines={1}>
                    {search ? `Search Results ("${search}")` : (categoryList.find((c) => String(c.id).toLowerCase() === String(selectedCategory).toLowerCase())?.title || selectedCategory)}
                  </Text>
                  <Text className="text-[10px] text-[#6d7a72] font-semibold mt-0.5">
                    {displayedProducts.length} {displayedProducts.length === 1 ? 'Product Available' : 'Products Available'}
                  </Text>
                </View>
                {selectedCategory !== 'ALL' && !search && (
                  <TouchableOpacity
                    onPress={() => handleSelectCategory('ALL')}
                    activeOpacity={0.7}
                    className="px-2.5 py-1 bg-[#006948]/10 rounded-md border border-[#006948]/20"
                  >
                    <Text className="text-[10px] font-bold text-[#006948]">Show All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Filtered Product Grid */}
              {displayedProducts.length > 0 ? (
                <View className="flex-row flex-wrap justify-between gap-y-3">
                  {displayedProducts.map((item) => (
                    <ProductCard key={item._id || item.id} item={item} navigation={navigation} addItem={addItem} />
                  ))}
                </View>
              ) : (
                <View className="py-12 bg-white/60 rounded-2xl items-center justify-center border border-dashed border-[#bccac0]/50 mt-4">
                  <Icon name="inventory" size={32} color="#6d7a72" />
                  <Text className="text-xs text-[#131b2e] font-bold mt-2">
                    No products in this category
                  </Text>
                  <Text className="text-[10px] text-[#6d7a72] mt-0.5">
                    Select another category from the left menu or tap 'Show All'.
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Reusable Touch-Responsive Product Card Component (Memoized)
const ProductCard = React.memo(function ProductCard({ item, navigation, addItem }) {
  return (
    <View className="w-[48.5%] bg-white rounded-xl p-2.5 shadow-sm justify-between border border-[#eaedff]">
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        activeOpacity={0.7}
        delayPressIn={0}
      >
        <View className="relative w-full h-24 rounded-lg bg-[#f2f3ff] justify-center items-center p-1.5 mb-1.5 overflow-hidden border border-[#eaedff]/60">
          <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="contain" />
          {item.badge && (
            <View className="absolute top-1 left-1 z-10 bg-[#85f8c4] px-1.5 py-0.5 rounded shadow-sm">
              <Text className="text-[8px] text-[#002114] font-bold">{item.badge}</Text>
            </View>
          )}
        </View>
        <Text className="text-[11px] font-bold text-[#131b2e]" numberOfLines={1}>
          {item.name || item.title}
        </Text>
        <Text className="text-[9px] text-[#3d4a42]" numberOfLines={1}>
          {item.subtitle || item.description}
        </Text>
      </TouchableOpacity>

      <View className="flex-row items-center justify-between mt-2 pt-1.5 border-t border-[#f2f3ff]">
        <View className="flex-row items-baseline gap-0.5">
          <Text className="text-xs font-extrabold text-[#131b2e]">₹{item.price}</Text>
          {item.mrp && <Text className="text-[8px] text-[#6d7a72] line-through">₹{item.mrp}</Text>}
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
