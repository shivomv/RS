import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';

export default function CheckoutPaymentScreen({ navigation }) {
  const { items, totalAmount, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const { session } = useAuthStore();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load addresses on mount
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setLoadingAddresses(true);
        
        if (!session?.user?._id) {
          console.warn('[Checkout] No user session, skipping address load');
          setLoadingAddresses(false);
          return;
        }

        const res = await api.getAddresses(session.user._id);
        const addressList = res || [];
        
        const formattedAddresses = addressList.map((addr) => ({
          _id: addr._id,
          streetAddress: addr.streetAddress,
          facilityName: addr.facilityName,
          city: addr.city,
          pincode: addr.pincode,
          landmark: addr.landmark,
          contactPhone: addr.contactPhone,
        }));

        setAddresses(formattedAddresses);
        
        if (formattedAddresses.length > 0) {
          setSelectedAddressId(formattedAddresses[0]._id);
        } else {
          setSelectedAddressId(null);
        }
      } catch (err) {
        console.error('[Checkout] Load addresses error:', err.message);
        setAddresses([]);
        setSelectedAddressId(null);
      } finally {
        setLoadingAddresses(false);
      }
    };
    
    loadAddresses();
  }, [session]);

  const subtotal = totalAmount();
  const total = subtotal;

  const handleConfirmOrder = async () => {
    if (items.length === 0) {
      alertService.warning('Empty Cart', 'Please add items to cart before proceeding to checkout.');
      return;
    }

    if (!selectedAddressId || addresses.length === 0) {
      alertService.error('Address Required', 'Please select a delivery address to proceed with the order.');
      return;
    }

    const selectedAddr = addresses.find(addr => addr._id === selectedAddressId);
    if (!selectedAddr) {
      alertService.error('Error', 'Selected address not found.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Freeze Immutable Itemized Product Snapshot
      const itemSnapshots = items.map((i) => {
        const uPrice = i.price || i.product?.price || 99;
        const qty = i.quantity || 1;
        return {
          id: i._id || i.product?._id || `item-${Math.random()}`,
          productId: i._id || i.product?._id,
          name: i.name || i.product?.name || 'Ultra-Clean Floor Cleaner',
          subtitle: i.size || i.product?.size || '500ml',
          size: i.size || i.product?.size || '500ml',
          unitPrice: uPrice,
          price: uPrice,
          qty: qty,
          quantity: qty,
          lineTotal: uPrice * qty,
          image: i.image || i.product?.image || '',
        };
      });

      // Freeze Immutable Address & Buyer Snapshot
      const addressSnapshot = {
        fullAddress: selectedAddr.streetAddress,
        facilityName: selectedAddr.facilityName,
        city: selectedAddr.city,
        pincode: selectedAddr.pincode,
        landmark: selectedAddr.landmark,
        contactPhone: selectedAddr.contactPhone,
        capturedAt: new Date().toISOString(),
      };

      const buyerSnapshot = {
        name: session?.user?.name || session?.user?.shopName || 'Registered Customer',
        mobile: session?.mobile || session?.user?.mobile || '9876543210',
      };

      const financialSnapshot = {
        subtotal,
        gstAmount: 0,
        totalAmount: total,
      };

      const orderIdToUse = `RS-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderPayload = {
        orderId: orderIdToUse,
        date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'pending',
        subtotal,
        total,
        totalAmount: total,
        paymentMethod: 'Cash on Delivery (COD)',
        paymentStatus: 'pending',
        deliveryAddress: selectedAddr.streetAddress,
        deliveryAddressSnapshot: addressSnapshot,
        buyerSnapshot: buyerSnapshot,
        financialSnapshot: financialSnapshot,
        items: itemSnapshots,
        shopkeeper: session?.user?._id,
      };

      const createdOrder = await addOrder(orderPayload);
      clearCart();
      navigation.replace('OrderSuccess', { order: createdOrder || orderPayload });
    } catch (err) {
      alertService.error('Order Failed', err.message || 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Guest Account Login Required View if user is not logged in
  if (!session) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
        <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm z-10">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center active:opacity-70"
            >
              <Icon name="arrow-back" size={20} color="#131b2e" />
            </Pressable>
            <Text className="text-base font-bold text-[#131b2e]">Checkout</Text>
          </View>
          <RSLogo size="sm" showText={false} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 60, alignItems: 'center' }}
          className="flex-1"
        >
          <View className="w-20 h-20 rounded-full bg-[#006948]/10 justify-center items-center mb-4 mt-8">
            <Icon name="lock-outline" size={44} color="#006948" />
          </View>
          <Text className="text-lg font-black text-[#131b2e] text-center">
            Login Required to Place Order
          </Text>
          <Text className="text-xs text-[#3d4a42] text-center mt-2 px-2 leading-relaxed">
            Please log in or create an account with your registered mobile number to proceed to checkout and complete your order.
          </Text>

          <Pressable
            onPress={() => navigation.navigate('Login', { returnScreen: 'CheckoutPayment' })}
            className="bg-[#006948] w-full rounded-2xl py-3.5 items-center justify-center flex-row gap-2 mt-8 shadow-md"
          >
            <Icon name="login" size={20} color="#ffffff" />
            <Text className="text-sm text-white font-extrabold">Log In / Register</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      {/* Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center active:opacity-70"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </Pressable>
          <Text className="text-base font-bold text-[#131b2e]">Checkout</Text>
        </View>
        <RSLogo size="sm" showText={false} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
        {/* Delivery Address Section */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#eaedff]">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-1.5">
              <Icon name="location-on" size={18} color="#006948" />
              <Text className="text-xs font-bold text-[#131b2e]">Delivery Destination</Text>
            </View>
            {addresses.length > 0 && (
              <Pressable
                onPress={() => navigation.navigate('AddressList')}
                className="bg-[#006948]/10 px-2.5 py-1 rounded-full active:opacity-80"
              >
                <Text className="text-[10px] text-[#006948] font-bold">Change</Text>
              </Pressable>
            )}
          </View>

          {loadingAddresses ? (
            <Text className="text-xs text-[#6d7a72]">Loading addresses...</Text>
          ) : selectedAddressId && addresses.length > 0 ? (
            <>
              <Text className="text-xs text-[#3d4a42] leading-relaxed mb-2">
                {addresses.find(addr => addr._id === selectedAddressId)?.streetAddress}
              </Text>
              <Text className="text-[10px] text-[#6d7a72]">
                {addresses.find(addr => addr._id === selectedAddressId)?.facilityName} • {addresses.find(addr => addr._id === selectedAddressId)?.city}
              </Text>
            </>
          ) : (
            <Pressable
              onPress={() => navigation.navigate('AddAddress')}
              className="bg-[#006948]/10 rounded-xl py-3 px-4 items-center border border-[#006948]/20"
            >
              <View className="flex-row items-center gap-2">
                <Icon name="add-location" size={18} color="#006948" />
                <Text className="text-xs font-bold text-[#006948]">Add Delivery Address</Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Payment Methods Section - COD Only */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#eaedff]">
          <Text className="text-xs font-bold text-[#131b2e] mb-3">Payment Method</Text>

          <View className="p-3.5 rounded-xl border border-[#006948] bg-[#f0fff8] flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-[#006948]/10 justify-center items-center">
                <Icon name="local-shipping" size={20} color="#006948" />
              </View>
              <View>
                <Text className="text-xs font-bold text-[#131b2e]">Cash on Delivery (COD)</Text>
                <Text className="text-[10px] text-[#6d7a72]">Pay in cash upon order delivery</Text>
              </View>
            </View>
            <View className="w-5 h-5 rounded-full border border-[#006948] bg-[#006948] justify-center items-center">
              <Icon name="check" size={12} color="#ffffff" />
            </View>
          </View>
        </View>

        {/* Bill Summary */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#eaedff]">
          <Text className="text-xs font-bold text-[#131b2e] mb-2">Payment Summary</Text>
          <View className="gap-1.5">
            <View className="flex-row justify-between">
              <Text className="text-xs text-[#6d7a72]">Subtotal ({items.length} items)</Text>
              <Text className="text-xs font-semibold text-[#131b2e]">₹{subtotal}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-[#6d7a72]">Express Delivery</Text>
              <Text className="text-xs font-bold text-[#006948]">FREE</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-[#f2f3ff] mt-1">
              <Text className="text-sm font-bold text-[#131b2e]">Total Payable</Text>
              <Text className="text-base font-extrabold text-[#006948]">₹{total}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#dae2fd] p-4 flex-row items-center justify-between shadow-lg">
        <View>
          <Text className="text-[10px] text-[#6d7a72]">Total Amount</Text>
          <Text className="text-lg font-extrabold text-[#006948]">₹{total}</Text>
        </View>
        <Pressable
          onPress={handleConfirmOrder}
          disabled={!selectedAddressId || loadingAddresses || isSubmitting}
          className={`px-6 py-3.5 rounded-xl flex-row items-center gap-2 shadow-md active:opacity-90 ${
            (!selectedAddressId || loadingAddresses || isSubmitting) ? 'bg-[#006948]/40' : 'bg-[#006948]'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text className={`font-bold text-xs uppercase tracking-wider ${
                (!selectedAddressId || loadingAddresses) ? 'text-white/60' : 'text-white'
              }`}>
                Confirm Order (COD)
              </Text>
              <Icon name="arrow-forward" size={16} color={(!selectedAddressId || loadingAddresses) ? '#ffffff80' : '#ffffff'} />
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
