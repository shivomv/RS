import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useCartStore } from '../../store/cartStore';

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem(product);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

        <ScrollView className="flex-1 px-5">
          {/* Back Button */}
          <Pressable
            onPress={() => navigation.goBack()}
            className="flex-row items-center mt-4 mb-6"
          >
            <Icon name="arrow-left" size={20} color="#0f172a" />
            <Text className="text-slate-950 font-bold ml-3">BACK TO CATALOG</Text>
          </Pressable>

          {/* Product Image */}
          <View className="w-full h-64 bg-blue-50 rounded-2xl justify-center items-center mb-6">
            <Icon name="box" size={64} color="#003E6F" />
          </View>

          {/* Category */}
          <Text className="text-xs font-semibold tracking-widest text-slate-500">
            {product.category}
          </Text>

          {/* Product Name */}
          <Text className="text-3xl font-black text-slate-950 mt-3">
            {product.name}
          </Text>

          {/* Price */}
          <Text className="text-2xl font-black text-blue-600 mt-3">
            ₹{product.price}
          </Text>

          {/* Description */}
          <Text className="text-sm text-slate-600 leading-6 mt-6">
            {product.description}
          </Text>

          {/* Stock Status */}
          <View className="mt-8 px-4 py-3 bg-white rounded-lg">
            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-semibold text-slate-500">STOCK AVAILABLE</Text>
              <Text className={`text-sm font-black ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stockQuantity} units
              </Text>
            </View>
          </View>

          {/* Add to Cart Button */}
          <Pressable
            onPress={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className={`${product.stockQuantity === 0 ? 'bg-slate-300' : 'bg-blue-600'} rounded-lg py-4 items-center mt-8 mb-8`}
          >
            <Text className="text-white font-black tracking-wider text-xs">
              {product.stockQuantity === 0 ? 'OUT OF STOCK' : 'ADD TO ORDER'}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ProductDetailScreen;
