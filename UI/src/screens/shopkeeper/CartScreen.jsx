import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function CartScreen({ navigation }) {
  const { session } = useAuthStore();
  const { items, clearCart, removeItem, updateQuantity, totalAmount } = useCartStore();

  const [gstRequested, setGstRequested] = useState(true);

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

  const subtotal = totalAmount();
  const gstAmount = gstRequested ? Math.round(subtotal * 0.18) : 0;
  const grandTotal = subtotal;

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Cart Empty', 'Please add products to your cart before proceeding to checkout.');
      return;
    }

    if (!session) {
      Alert.alert(
        'Login Required',
        'Please log in or create an account to proceed to checkout.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log In / Register',
            onPress: () => navigation.navigate('Login', { returnScreen: 'CheckoutPayment' }),
          },
        ]
      );
      return;
    }
    navigation.navigate('CheckoutPayment');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Top Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm z-10">
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
            className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center border border-[#dae2fd]"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </TouchableOpacity>
          <RSLogo size="sm" showText={false} />
          <Text className="text-base font-bold text-[#131b2e] ml-1">View Cart</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity activeOpacity={0.7} className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center border border-[#dae2fd]">
            <Icon name="help-outline" size={20} color="#3d4a42" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Fast Delivery & Dispatch Notice Bar */}
        <View className="px-4 pt-4">
          <View className="bg-white rounded-2xl p-3 shadow-sm flex-row items-center justify-between border border-[#eaedff]">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-[#99efe5]/40 justify-center items-center">
                <Icon name="electric-moped" size={22} color="#006a63" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[10px] font-bold text-[#006948] uppercase tracking-wider">
                    Fast Dispatch
                  </Text>
                  <View className="w-1 h-1 rounded-full bg-[#006948]" />
                  <Text className="text-[10px] text-[#006f67] font-semibold">Direct Factory Delivery</Text>
                </View>
                <Text className="text-xs font-bold text-[#131b2e]">
                  Instant GST Invoice Generation
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dynamic Cart Items List */}
        <View className="px-4 pt-3">
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">
            <View className="flex-row justify-between items-center pb-3 border-b border-[#f2f3ff]">
              <Text className="text-xs font-extrabold text-[#131b2e] uppercase tracking-wider">
                Cart Items ({items.length} {items.length === 1 ? 'Entry' : 'Entries'})
              </Text>
              {items.length > 0 && (
                <TouchableOpacity activeOpacity={0.7} onPress={() => clearCart()}>
                  <Text className="text-xs font-bold text-[#ba1a1a]">Clear Cart</Text>
                </TouchableOpacity>
              )}
            </View>

            {items.length > 0 ? (
              items.map((item, idx) => {
                const itemKey = item.cartItemId || `${item._id}-${item.size || idx}`;
                const itemTotal = (item.price || 99) * (item.quantity || 1);

                return (
                  <View
                    key={itemKey}
                    className={`py-3.5 flex-row gap-3 ${
                      idx < items.length - 1 ? 'border-b border-[#f2f3ff]' : ''
                    }`}
                  >
                    <View className="w-16 h-16 rounded-xl bg-[#f2f3ff] justify-center items-center p-1 border border-[#eaedff]">
                      {item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      ) : (
                        <Icon name="inventory-2" size={32} color="#bccac0" />
                      )}
                    </View>
                    <View className="flex-1 justify-between">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-2">
                          <Text className="text-xs font-bold text-[#131b2e]" numberOfLines={2}>
                            {item.title || item.name}
                          </Text>
                          {item.bundleLabel ? (
                            <View className="flex-row items-center gap-1.5 mt-1">
                              <View className="bg-[#006948]/10 px-2 py-0.5 rounded border border-[#006948]/20">
                                <Text className="text-[9.5px] font-bold text-[#006948]">
                                  {item.bundleLabel}
                                </Text>
                              </View>
                            </View>
                          ) : null}
                        </View>
                        <TouchableOpacity
                          onPress={() => removeItem(itemKey)}
                          activeOpacity={0.7}
                          className="p-1"
                        >
                          <Icon name="delete-outline" size={18} color="#ba1a1a" />
                        </TouchableOpacity>
                      </View>

                      <View className="flex-row justify-between items-end mt-2">
                        <View>
                          <Text className="text-xs font-extrabold text-[#131b2e]">
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </Text>
                          <Text className="text-[9px] text-[#006948] font-semibold">
                            ₹{item.price}/unit
                          </Text>
                        </View>

                        {/* Quantity Stepper */}
                        <View className="h-7 bg-[#006948] rounded-lg flex-row items-center px-1">
                          <TouchableOpacity
                            onPress={() => updateQuantity(itemKey, (item.quantity || 1) - 1)}
                            activeOpacity={0.7}
                            className="w-6 h-full justify-center items-center"
                          >
                            <Icon name="remove" size={14} color="#ffffff" />
                          </TouchableOpacity>
                          <Text className="px-2 text-xs font-bold text-white">
                            {item.quantity}
                          </Text>
                          <TouchableOpacity
                            onPress={() => updateQuantity(itemKey, (item.quantity || 1) + 1)}
                            activeOpacity={0.7}
                            className="w-6 h-full justify-center items-center"
                          >
                            <Icon name="add" size={14} color="#ffffff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="py-10 items-center justify-center">
                <Icon name="shopping-cart" size={36} color="#6d7a72" />
                <Text className="text-xs font-bold text-[#131b2e] mt-2">Your Cart is Empty</Text>
                <Text className="text-[10px] text-[#6d7a72] mt-0.5 mb-4">
                  Browse products and select variants to add them to your cart.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Catalog')}
                  className="bg-[#006948] px-4 py-2 rounded-xl"
                >
                  <Text className="text-xs text-white font-bold">Browse Products</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* GST Invoice Option */}
        {items.length > 0 && (
          <View className="px-4 pt-3">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View className="w-10 h-10 rounded-full bg-[#99efe5]/40 justify-center items-center">
                  <Icon name="receipt" size={20} color="#006f67" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#131b2e]">GST Invoice Claim (18% Input Tax)</Text>
                  <Text className="text-[10px] text-[#3d4a42]">Registered GST Tax Invoice Provided</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setGstRequested(!gstRequested)}
                activeOpacity={0.7}
                className={`w-6 h-6 rounded-md items-center justify-center border ${
                  gstRequested ? 'bg-[#006948] border-[#006948]' : 'bg-white border-[#bccac0]'
                }`}
              >
                {gstRequested && <Icon name="check" size={16} color="#ffffff" />}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Payment Summary */}
        {items.length > 0 && (
          <View className="px-4 pt-3">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">
              <Text className="text-xs font-extrabold text-[#131b2e] uppercase tracking-wider pb-2 border-b border-[#f2f3ff]">
                Payment Summary
              </Text>

              <View className="py-2.5 gap-2 border-b border-[#f2f3ff]">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-[#3d4a42]">Subtotal</Text>
                  <Text className="text-xs text-[#131b2e] font-bold">₹{subtotal.toLocaleString('en-IN')}</Text>
                </View>

                {gstRequested && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-[#3d4a42]">Estimated GST (18% Input Credit)</Text>
                    <Text className="text-xs text-[#006948] font-bold">₹{gstAmount.toLocaleString('en-IN')}</Text>
                  </View>
                )}

                <View className="flex-row justify-between">
                  <Text className="text-xs text-[#3d4a42]">Delivery & Handling</Text>
                  <Text className="text-xs text-[#006948] font-bold">FREE</Text>
                </View>
              </View>

              <View className="pt-3 flex-row justify-between items-center">
                <View>
                  <Text className="text-sm font-extrabold text-[#131b2e]">Total Amount</Text>
                </View>
                <Text className="text-lg font-black text-[#131b2e]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Checkout Bottom Bar */}
      {items.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#dae2fd] p-4 flex-row items-center justify-between shadow-xl z-30">
          <View>
            <Text className="text-[10px] text-[#3d4a42] font-semibold uppercase">Net Payable</Text>
            <Text className="text-lg font-black text-[#131b2e]">₹{grandTotal.toLocaleString('en-IN')}</Text>
          </View>

          <TouchableOpacity
            onPress={handleCheckout}
            activeOpacity={0.85}
            className="bg-[#006948] px-6 py-3 rounded-xl flex-row items-center gap-2 shadow-md active:bg-[#005238]"
          >
            <Text className="text-xs font-bold text-white uppercase tracking-wider">Proceed to Checkout</Text>
            <Icon name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
