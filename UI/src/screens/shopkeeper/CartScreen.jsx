import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';
import apiService from '../../services/api';

const CartScreen = ({ navigation }) => {
  const { items, removeItem, updateQuantity, clearCart, totalAmount, itemCount } = useCartStore();
  const { addOrder } = useOrderStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items before placing an order.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.product._id,
          productName: item.product.name,
          quantity: item.quantity,
          priceAtOrder: item.product.price,
        })),
        totalAmount: totalAmount(),
        status: 'pending',
      };

      const response = await apiService.createOrder(orderData);
      addOrder(response);
      clearCart();

      Alert.alert('Order Placed', 'Your order has been placed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
          <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
          <Icon name="shopping-cart" size={56} color="#94a3b8" />
          <Text className="mt-6 text-slate-500">Your cart is empty</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

        <View className="px-5 py-4">
          <Text className="text-xs tracking-widest font-bold text-slate-500">ORDER CART</Text>
          <Text className="text-2xl font-black text-slate-950 mt-1">REVIEW YOUR PROCUREMENT</Text>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.product._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 200 }}
          renderItem={({ item }) => (
            <CartItemRow item={item} onRemove={removeItem} onUpdateQuantity={updateQuantity} />
          )}
        />

        {/* Total & Checkout - Sticky Bottom */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-5 py-4 pb-8">
          <View className="mb-4">
            <View className="flex-row justify-between mb-3">
              <Text className="text-slate-500 font-semibold">Items ({itemCount()})</Text>
              <Text className="text-slate-950 font-black">₹{totalAmount()}</Text>
            </View>
          </View>

          <Pressable
            onPress={handlePlaceOrder}
            disabled={isSubmitting || items.length === 0}
            className="bg-blue-600 rounded-lg py-4 items-center opacity-90"
          >
            <Text className="text-white font-black tracking-wider text-xs">
              {isSubmitting ? 'PLACING ORDER...' : 'PLACE ORDER'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const CartItemRow = ({ item, onRemove, onUpdateQuantity }) => (
  <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-3 justify-between">
    <View className="flex-1">
      <Text className="text-slate-950 font-bold text-sm">{item.product.name}</Text>
      <Text className="text-slate-500 text-xs mt-1">
        {item.quantity} × ₹{item.product.price}
      </Text>
    </View>

    <View className="flex-row items-center gap-2 mx-3">
      <Pressable onPress={() => onUpdateQuantity(item.product._id, item.quantity - 1)}>
        <Icon name="minus-circle" size={18} color="#003E6F" />
      </Pressable>
      <Text className="w-6 text-center font-black text-sm">{item.quantity}</Text>
      <Pressable onPress={() => onUpdateQuantity(item.product._id, item.quantity + 1)}>
        <Icon name="plus-circle" size={18} color="#003E6F" />
      </Pressable>
    </View>

    <Pressable onPress={() => onRemove(item.product._id)} className="ml-3">
      <Icon name="trash-2" size={18} color="#ef4444" />
    </Pressable>

    <Text className="text-blue-600 font-black ml-4 w-16 text-right">
      ₹{item.product.price * item.quantity}
    </Text>
  </View>
);

export default CartScreen;
