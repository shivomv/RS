import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BlinkitAddButton from '../../components/BlinkitAddButton';
import LocationHeaderPill from '../../components/LocationHeaderPill';
import ServiceabilityBanner from '../../components/ServiceabilityBanner';
import LocationSelectorModal from '../../components/LocationSelectorModal';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useLocationStore } from '../../store/locationStore';

/**
 * Blinkit-Style Cart & Bill Screen
 * - Clean white card items with unit pricing & stepper
 * - Delivery promise pill (⚡ Delivery in 24-48 Hours)
 * - Bill Details breakdown with savings highlight
 * - Cancellation policy / Trust note
 * - Docked bottom checkout bar
 */
export default function CartScreen({ navigation }) {
  const { session } = useAuthStore();
  const cartStore = useCartStore();
  const { items, clearCart, removeItem, updateQuantity, totalAmount, itemCount } = cartStore;
  const { location, openModal } = useLocationStore();

  useEffect(() => {
    const loadCartData = async () => {
      if (session?.user?._id) {
        await cartStore.loadCart(session.user._id);
      }
    };
    loadCartData();
  }, []);

  // Hardware Back Handler
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

  const subtotal = totalAmount();
  const grandTotal = subtotal;
  const count = itemCount();

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Cart Empty', 'Please add products to your cart before proceeding to checkout.');
      return;
    }

    if (location && location.isServiceable === false) {
      Alert.alert(
        'Delivery Unavailable',
        `RS Industries does not service your selected location (${location.city || ''} ${location.pincode}). Please update your delivery pincode to proceed.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Change Pincode', onPress: openModal },
        ]
      );
      return;
    }

    navigation.navigate('CheckoutPayment', {
      cartItems: items,
      totalAmount: grandTotal,
    });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#f8fafc]">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Blinkit Top Header */}
      <View className="bg-white border-b border-[#e2e8f0] px-4 py-2.5 flex-row items-center justify-between shadow-xs">
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity
            onPress={() => navigation.navigate('ShopHome')}
            activeOpacity={0.7}
            className="w-8 h-8 rounded-full bg-[#f1f5f9] justify-center items-center border border-[#e2e8f0]"
          >
            <Icon name="arrow-back" size={18} color="#0f172a" />
          </TouchableOpacity>
          <View>
            <Text className="text-sm font-black text-[#0f172a]">My Cart ({count} {count === 1 ? 'item' : 'items'})</Text>
            <Text className="text-[10px] text-[#64748b]">Factory-Direct Wholesale</Text>
          </View>
        </View>
        <LocationHeaderPill />
      </View>

      <ServiceabilityBanner />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: items.length > 0 ? 85 : 30 }}
      >
        {items.length === 0 ? (
          <View className="py-20 px-4 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-[#f1f5f9] justify-center items-center border border-[#e2e8f0] mb-4">
              <Icon name="remove-shopping-cart" size={38} color="#94a3b8" />
            </View>
            <Text className="text-base font-black text-[#0f172a]">Your Cart is Empty</Text>
            <Text className="text-xs text-[#64748b] text-center mt-1.5 px-6">
              Explore our best-selling commercial and household cleaning formulations.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ShopHome')}
              activeOpacity={0.8}
              className="mt-6 bg-[#006948] px-6 py-2.5 rounded-xl shadow-xs"
            >
              <Text className="text-xs font-black text-white uppercase tracking-wider">
                Start Shopping
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-3.5 pt-3">
            {/* Blinkit Delivery Promise Banner */}
            <View className="bg-white rounded-2xl p-3 border border-[#e2e8f0] shadow-xs flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2.5">
                <View className="w-9 h-9 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] justify-center items-center">
                  <Icon name="bolt" size={20} color="#006948" />
                </View>
                <View>
                  <Text className="text-xs font-black text-[#0f172a]">
                    Delivery in 24-48 Hours
                  </Text>
                  <Text className="text-[10px] text-[#006948] font-bold">
                    Dispatched directly from factory hub
                  </Text>
                </View>
              </View>
              <View className="bg-[#f0fdf4] px-2 py-0.5 rounded border border-[#bbf7d0]">
                <Text className="text-[9.5px] font-black text-[#006948]">⚡ Express</Text>
              </View>
            </View>

            {/* Cart Items List */}
            <View className="bg-white rounded-2xl p-3.5 border border-[#e2e8f0] shadow-xs mb-3">
              <View className="flex-row justify-between items-center pb-2.5 border-b border-[#f1f5f9]">
                <Text className="text-xs font-black text-[#0f172a] uppercase tracking-wider">
                  Review Items ({items.length})
                </Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => clearCart()}>
                  <Text className="text-xs font-bold text-[#e11d48]">Clear All</Text>
                </TouchableOpacity>
              </View>

              {items.map((item, idx) => {
                const itemKey = item.cartItemId || `${item._id}-${item.size || idx}`;
                const itemTotal = (item.price || 0) * (item.quantity || 1);

                return (
                  <View
                    key={itemKey}
                    className={`py-3 flex-row items-center gap-3 ${
                      idx < items.length - 1 ? 'border-b border-[#f1f5f9]' : ''
                    }`}
                  >
                    {/* Item Image */}
                    <View className="w-16 h-16 rounded-xl bg-[#f8fafc] justify-center items-center border border-[#e2e8f0] overflow-hidden">
                      {item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      ) : (
                        <Icon name="inventory-2" size={26} color="#94a3b8" />
                      )}
                    </View>

                    {/* Title & Bundle Info */}
                    <View className="flex-1">
                      <Text className="text-xs font-black text-[#0f172a]" numberOfLines={2}>
                        {item.title || item.name}
                      </Text>
                      {item.bundleLabel && (
                        <View className="bg-[#f0fdf4] self-start px-1.5 py-0.5 rounded border border-[#bbf7d0] mt-1">
                          <Text className="text-[9px] font-bold text-[#006948]">
                            {item.bundleLabel}
                          </Text>
                        </View>
                      )}
                      <View className="flex-row items-baseline gap-1 mt-1">
                        <Text className="text-xs font-black text-[#0f172a]">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </Text>
                        <Text className="text-[9px] text-[#64748b]">
                          (₹{item.price}/unit)
                        </Text>
                      </View>
                    </View>

                    {/* Blinkit Stepper Button */}
                    <BlinkitAddButton
                      quantity={item.quantity || 1}
                      onIncrement={() => updateQuantity(itemKey, (item.quantity || 1) + 1)}
                      onDecrement={() => updateQuantity(itemKey, (item.quantity || 1) - 1)}
                      size="sm"
                    />
                  </View>
                );
              })}
            </View>

            {/* Blinkit Bill Details Card */}
            <View className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-xs mb-3">
              <Text className="text-xs font-black text-[#0f172a] uppercase tracking-wider pb-2 border-b border-[#f1f5f9]">
                Bill Summary
              </Text>

              <View className="py-2.5 gap-2 border-b border-[#f1f5f9]">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-[#64748b]">Item Total</Text>
                  <Text className="text-xs font-bold text-[#0f172a]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-xs text-[#64748b]">Delivery Partner Fee</Text>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[10px] text-[#94a3b8] line-through">₹40</Text>
                    <Text className="text-xs font-bold text-[#006948]">FREE</Text>
                  </View>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-xs text-[#64748b]">Handling & Packing</Text>
                  <Text className="text-xs font-bold text-[#006948]">FREE</Text>
                </View>
              </View>

              <View className="pt-2.5 flex-row justify-between items-center">
                <View>
                  <Text className="text-xs font-black text-[#0f172a]">Grand Total</Text>
                  <Text className="text-[10px] text-[#006948] font-bold">Inclusive of all taxes</Text>
                </View>
                <Text className="text-base font-black text-[#0f172a]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Blinkit Cancellation Policy Note */}
            <View className="bg-[#f8fafc] rounded-2xl p-3 border border-[#e2e8f0] mb-2 flex-row gap-2.5 items-center">
              <Icon name="verified-user" size={18} color="#006948" />
              <View className="flex-1">
                <Text className="text-[10px] font-black text-[#0f172a]">
                  100% Genuine Lab-Certified Chemicals
                </Text>
                <Text className="text-[9.5px] text-[#64748b]">
                  Manufactured and packaged directly at RS Industries plant.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Checkout Bottom Bar (Directly connected to Bottom Nav with zero space) */}
      {items.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] px-4 py-2.5 flex-row items-center justify-between shadow-xl z-30">
          <View>
            <Text className="text-[10px] text-[#64748b] font-bold uppercase">To Pay</Text>
            <Text className="text-lg font-black text-[#0f172a]">
              ₹{grandTotal.toLocaleString('en-IN')}
            </Text>
          </View>

          {location && location.isServiceable === false ? (
            <TouchableOpacity
              onPress={openModal}
              activeOpacity={0.85}
              className="bg-[#e11d48] px-5 py-3 rounded-xl flex-row items-center gap-2 shadow-sm"
            >
              <Icon name="location-off" size={18} color="#ffffff" />
              <Text className="text-xs font-bold text-white uppercase tracking-wider">
                Unavailable Here
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleCheckout}
              activeOpacity={0.85}
              className="bg-[#006948] px-6 py-3 rounded-xl flex-row items-center gap-2 shadow-sm active:bg-[#005238]"
            >
              <Text className="text-xs font-black text-white uppercase tracking-wider">
                Proceed to Checkout
              </Text>
              <Icon name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <LocationSelectorModal />
    </SafeAreaView>
  );
}
