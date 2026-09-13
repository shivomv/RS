import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import apiService from '../../services/api';

const HomeScreen = ({ navigation }) => {
  const { products, isLoading, setProducts, setLoading, setError } = useProductStore();
  const { items: cartItems } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#003E6F" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Header */}
          <View className="px-5 py-4 flex-row justify-between items-center">
            <View>
              <Text className="text-xs tracking-widest font-bold text-slate-400">RS INDUSTRIES</Text>
              <Text className="text-xl font-black text-slate-950 mt-1">BULK PROCUREMENT</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('CartTab')}
              className="relative"
            >
              <Icon name="shopping-cart" size={24} color="#003E6F" />
              {cartItems.length > 0 && (
                <View className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 justify-center items-center">
                  <Text className="text-white text-xs font-black">{cartItems.length}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Hero Banner */}
          <View className="mx-5 mb-6 bg-blue-600 rounded-3xl px-6 py-6">
            <Text className="text-xs font-bold text-blue-100 tracking-widest">PARTNER DASHBOARD</Text>
            <Text className="text-2xl font-black text-white mt-3">Stock up. Move faster.</Text>
            <Text className="text-blue-100 mt-2 leading-5">Reliable distribution for your next order cycle.</Text>

            <View className="flex-row mt-6 gap-6">
              <View>
                <Text className="text-xs font-bold text-blue-100 tracking-wider">ACTIVE ORDERS</Text>
                <Text className="text-xl font-black text-white mt-1">03</Text>
              </View>
              <View>
                <Text className="text-xs font-bold text-blue-100 tracking-wider">OUTSTANDING</Text>
                <Text className="text-xl font-black text-white mt-1">₹12.4K</Text>
              </View>
            </View>
          </View>

          {/* Section Title */}
          <View className="px-5 mb-4 flex-row justify-between items-center">
            <Text className="text-lg font-black text-slate-950">PRODUCT CATALOG</Text>
            <Pressable onPress={() => navigation.navigate('CatalogTab')}>
              <Text className="text-xs font-bold text-blue-600">VIEW ALL</Text>
            </Pressable>
          </View>

          {/* Products Grid */}
          <View className="px-5">
            <View className="flex-row flex-wrap justify-between">
              {products.slice(0, 4).map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onPress={() => navigation.navigate('ProductDetail', { product })}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const ProductCard = ({ product, onPress }) => (
  <Pressable
    onPress={onPress}
    className="w-[48%] bg-white rounded-2xl p-3 mb-4 shadow-sm"
  >
    <View className="w-full h-32 bg-blue-50 rounded-xl justify-center items-center mb-3">
      <Icon name="box" size={34} color="#2563eb" />
    </View>
    <Text className="text-xs font-bold text-slate-400" numberOfLines={1}>
      {product.category}
    </Text>
    <Text className="text-sm font-bold text-slate-950 mt-1" numberOfLines={2}>
      {product.name}
    </Text>
    <Text className="text-blue-600 font-black mt-2">₹{product.price}</Text>
  </Pressable>
);

export default HomeScreen;
