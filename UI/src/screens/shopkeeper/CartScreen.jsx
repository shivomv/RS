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
import QuickAddButton from '../../components/QuickAddButton';
import LocationHeaderPill from '../../components/LocationHeaderPill';
import LocationSelectorModal from '../../components/LocationSelectorModal';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useLocationStore } from '../../store/locationStore';

/**
 * CartScreen matching Hyperlocal preview aesthetic:
 * - Direct delivery promise
 * - Item list with steppers
 * - Bill breakdown
 * - Docked checkout bar
 */
export default function CartScreen({ navigation }) {
  const { session } = useAuthStore();
  const cartStore = useCartStore();
  const { items, clearCart, updateQuantity, totalAmount, itemCount } = cartStore;
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
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#F4F6FB]">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Header */}
      <View className="bg-white border-b border-[#E8E8E8] px-4 py-2.5 flex-row items-center justify-between shadow-xs">
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity
            onPress={() => navigation.navigate('ShopHome')}
            activeOpacity={0.7}
            className="w-8 h-8 rounded-full bg-[#F4F6FB] justify-center items-center border border-[#E8E8E8]"
          >
            <Icon name="arrow-back" size={18} color="#1C1C1C" />
          </TouchableOpacity>
          <View>
            <Text className="text-sm font-black text-[#1C1C1C]">
              My Cart ({count} {count === 1 ? 'item' : 'items'})
            </Text>
            <Text className="text-[10px] text-[#666666]">Direct Factory Supply</Text>
          </View>
        </View>
        <LocationHeaderPill />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: items.length > 0 ? 85 : 30 }}
      >
        {items.length === 0 ? (
          <View className="py-20 px-4 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-white justify-center items-center border border-[#E8E8E8] mb-4 shadow-xs">
              <Icon name="remove-shopping-cart" size={38} color="#94a3b8" />
            </View>
            <Text className="text-base font-black text-[#1C1C1C]">Your Cart is Empty</Text>
            <Text className="text-xs text-[#666666] text-center mt-1.5 px-6">
              Browse our factory catalog to add cleaning supplies to your cart.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ShopHome')}
              activeOpacity={0.8}
              className="mt-6 bg-[#0C831F] px-6 py-2.5 rounded-xl shadow-xs"
            >
              <Text className="text-xs font-black text-white uppercase tracking-wider">
                Start Shopping
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-3.5 pt-3">
            {/* Delivery Banner */}
            <View className="bg-white rounded-2xl p-3 border border-[#E8E8E8] shadow-xs flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2.5">
                <View className="w-9 h-9 rounded-xl bg-[#EBF7EE] border border-[#0C831F]/30 justify-center items-center">
                  <Icon name="bolt" size={20} color="#0C831F" />
                </View>
                <View>
                  <Text className="text-xs font-black text-[#1C1C1C]">
                    Delivery in 10-15 Minutes
                  </Text>
                  <Text className="text-[10px] text-[#0C831F] font-bold">
                    Dispatched from nearby local hub
                  </Text>
                </View>
              </View>
              <View className="bg-[#EBF7EE] px-2 py-0.5 rounded">
                <Text className="text-[9.5px] font-black text-[#0C831F]">⚡ Superfast</Text>
              </View>
            </View>

            {/* Cart Items List */}
            <View className="bg-white rounded-2xl p-3.5 border border-[#E8E8E8] shadow-xs mb-3">
              <View className="flex-row justify-between items-center pb-2.5 border-b border-[#F4F6FB]">
                <Text className="text-xs font-black text-[#1C1C1C] uppercase tracking-wider">
                  Review Items ({items.length})
                </Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => clearCart()}>
                  <Text className="text-xs font-bold text-[#ba1a1a]">Clear All</Text>
                </TouchableOpacity>
              </View>

              {items.map((item, idx) => {
                const itemKey = item.cartItemId || `${item._id}-${item.size || idx}`;
                const itemTotal = (item.price || 0) * (item.quantity || 1);

                return (
                  <View
                    key={itemKey}
                    className={`py-3 flex-row items-center gap-3 ${
                      idx < items.length - 1 ? 'border-b border-[#F4F6FB]' : ''
                    }`}
                  >
                    {/* Item Image */}
                    <View className="w-16 h-16 rounded-xl bg-[#F8FAFC] justify-center items-center border border-[#E8E8E8] overflow-hidden">
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
                      <Text className="text-xs font-bold text-[#1C1C1C]" numberOfLines={2}>
                        {item.title || item.name}
                      </Text>
                      {item.bundleLabel && (
                        <View className="bg-[#EBF7EE] self-start px-1.5 py-0.5 rounded border border-[#0C831F]/30 mt-1">
                          <Text className="text-[9px] font-bold text-[#0C831F]">
                            {item.bundleLabel}
                          </Text>
                        </View>
                      )}
                      <View className="flex-row items-baseline gap-1 mt-1">
                        <Text className="text-xs font-black text-[#1C1C1C]">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </Text>
                        <Text className="text-[9px] text-[#666666]">
                          (₹{item.price}/unit)
                        </Text>
                      </View>
                    </View>

                    {/* Quantity Stepper */}
                    <QuickAddButton
                      quantity={item.quantity || 1}
                      onIncrement={() => updateQuantity(itemKey, (item.quantity || 1) + 1)}
                      onDecrement={() => updateQuantity(itemKey, (item.quantity || 1) - 1)}
                      size="sm"
                    />
                  </View>
                );
              })}
            </View>

            {/* Bill Details */}
            <View className="bg-white rounded-2xl p-4 border border-[#E8E8E8] shadow-xs mb-3">
              <Text className="text-xs font-black text-[#1C1C1C] uppercase tracking-wider pb-2 border-b border-[#F4F6FB]">
                Bill Details
              </Text>

              <View className="py-2.5 gap-2 border-b border-[#F4F6FB]">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-[#666666]">Item Total</Text>
                  <Text className="text-xs font-bold text-[#1C1C1C]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-xs text-[#666666]">Delivery Fee</Text>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[10px] text-[#94a3b8] line-through">₹25</Text>
                    <Text className="text-xs font-bold text-[#0C831F]">FREE</Text>
                  </View>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-xs text-[#666666]">Handling Charge</Text>
                  <Text className="text-xs font-bold text-[#0C831F]">FREE</Text>
                </View>
              </View>

              <View className="pt-2.5 flex-row justify-between items-center">
                <View>
                  <Text className="text-xs font-black text-[#1C1C1C]">Grand Total</Text>
                  <Text className="text-[10px] text-[#0C831F] font-bold">Inclusive of all taxes</Text>
                </View>
                <Text className="text-base font-black text-[#1C1C1C]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Docked Checkout Bar */}
      {items.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E8E8E8] px-4 py-2.5 flex-row items-center justify-between shadow-xl z-30">
          <View>
            <Text className="text-[10px] text-[#666666] font-bold uppercase">To Pay</Text>
            <Text className="text-lg font-black text-[#1C1C1C]">
              ₹{grandTotal.toLocaleString('en-IN')}
            </Text>
          </View>

          {location && location.isServiceable === false ? (
            <TouchableOpacity
              onPress={openModal}
              activeOpacity={0.85}
              className="bg-[#ba1a1a] px-5 py-3 rounded-xl flex-row items-center gap-2 shadow-sm"
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
              className="bg-[#0C831F] px-6 py-3 rounded-xl flex-row items-center gap-2 shadow-sm active:bg-[#075E15]"
            >
              <Text className="text-xs font-black text-white uppercase tracking-wider">
                Proceed to Pay
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
