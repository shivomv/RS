import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';

export default function CheckoutPaymentScreen({ navigation }) {
  const { items, totalAmount, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const { session } = useAuthStore();

  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [selectedAddress, setSelectedAddress] = useState(null);

  const subtotal = totalAmount();
  const total = subtotal;

  const handleConfirmOrder = () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before proceeding to checkout.');
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select a delivery address to proceed with the order.');
      return;
    }

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
      fullAddress: selectedAddress,
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

    const newOrder = Object.freeze({
      id: `RS-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'dispatching',
      subtotal,
      total,
      paymentMethod: selectedPayment === 'upi' ? 'UPI' : 'Net Banking / Cash',
      deliveryAddress: selectedAddress,
      deliveryAddressSnapshot: addressSnapshot,
      buyerSnapshot: buyerSnapshot,
      financialSnapshot: financialSnapshot,
      items: itemSnapshots,
    });

    addOrder(newOrder);
    clearCart();

    navigation.replace('OrderSuccess', { order: newOrder });
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
            <Pressable
              onPress={() => navigation.navigate('AddressList')}
              className="bg-[#006948]/10 px-2.5 py-1 rounded-full active:opacity-80"
            >
              <Text className="text-[10px] text-[#006948] font-bold">Change Facility</Text>
            </Pressable>
          </View>
          <Text className="text-xs text-[#3d4a42] leading-relaxed">{selectedAddress}</Text>
        </View>

        {/* Payment Methods Section */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#eaedff]">
          <Text className="text-xs font-bold text-[#131b2e] mb-3">Select Payment Method</Text>

          {/* Option 1: Instant UPI */}
          <Pressable
            onPress={() => setSelectedPayment('upi')}
            className={`p-3.5 rounded-xl border mb-2.5 flex-row items-center justify-between ${
              selectedPayment === 'upi' ? 'border-[#006948] bg-[#f0fff8]' : 'border-[#eaedff] bg-white'
            }`}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-[#9cf2e8] justify-center items-center">
                <Icon name="qr-code" size={20} color="#00201d" />
              </View>
              <View>
                <Text className="text-xs font-bold text-[#131b2e]">Instant UPI / QR Code</Text>
                <Text className="text-[10px] text-[#6d7a72]">Google Pay, PhonePe, Paytm</Text>
              </View>
            </View>
            <View className={`w-5 h-5 rounded-full border justify-center items-center ${selectedPayment === 'upi' ? 'border-[#006948] bg-[#006948]' : 'border-[#6d7a72]'}`}>
              {selectedPayment === 'upi' && <Icon name="check" size={12} color="#ffffff" />}
            </View>
          </Pressable>

          {/* Option 2: Cash on Delivery / Bank Transfer */}
          <Pressable
            onPress={() => setSelectedPayment('neft')}
            className={`p-3.5 rounded-xl border flex-row items-center justify-between ${
              selectedPayment === 'neft' ? 'border-[#006948] bg-[#f0fff8]' : 'border-[#eaedff] bg-white'
            }`}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center">
                <Icon name="account-balance" size={20} color="#3d4a42" />
              </View>
              <View>
                <Text className="text-xs font-bold text-[#131b2e]">Net Banking / NEFT / Cash</Text>
                <Text className="text-[10px] text-[#6d7a72]">Direct payment on dispatch or delivery</Text>
              </View>
            </View>
            <View className={`w-5 h-5 rounded-full border justify-center items-center ${selectedPayment === 'neft' ? 'border-[#006948] bg-[#006948]' : 'border-[#6d7a72]'}`}>
              {selectedPayment === 'neft' && <Icon name="check" size={12} color="#ffffff" />}
            </View>
          </Pressable>
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
          className="bg-[#006948] px-6 py-3.5 rounded-xl flex-row items-center gap-2 shadow-md active:opacity-90"
        >
          <Text className="text-white font-bold text-xs uppercase tracking-wider">Confirm Order</Text>
          <Icon name="arrow-forward" size={16} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
