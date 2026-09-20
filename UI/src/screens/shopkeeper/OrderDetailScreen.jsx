import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';

export default function OrderDetailScreen({ route, navigation }) {
  const { order } = route.params || {};

  const orderData = order || {
    id: 'RS-ORD-8942',
    date: '18 Sep 2026, 10:30 AM',
    status: 'Dispatching',
    total: 3450,
    gst: 621,
    deliveryAddress: 'Indiranagar Facilities Ltd, Plot 42, 10th Main, Bengaluru - 560038',
    driverName: 'Ramesh Kumar (RS Dispatch)',
    driverPhone: '+91 98765 12345',
    items: [
      { id: '1', name: 'RS Pro Citrus Floor Cleaner', subtitle: '500ml Bottle', qty: 10, price: 99 },
      { id: '2', name: 'PowerShield Pine Disinfectant', subtitle: '1L Disinfectant', qty: 5, price: 149 },
      { id: '3', name: 'Commercial Kitchen Degreaser', subtitle: '5L Canister', qty: 2, price: 580 },
    ],
  };

  const handleDownloadInvoice = () => {
    Alert.alert(
      'Tax Invoice Downloaded',
      `Official GST Tax Invoice for Order #${orderData.id} has been saved to your downloads folder.`,
      [{ text: 'OK' }]
    );
  };

  const trackingSteps = [
    { title: 'Order Placed', time: '10:30 AM', completed: true },
    { title: 'Payment Verified', time: '10:32 AM', completed: true },
    { title: 'Packed at Warehouse', time: '10:45 AM', completed: true },
    { title: 'Dispatched & En Route', time: 'Expected 11:15 AM', completed: orderData.status === 'Dispatched' || orderData.status === 'Dispatching' || orderData.status === 'Delivered' },
    { title: 'Delivered', time: 'Expected 11:25 AM', completed: orderData.status === 'Delivered' },
  ];

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
          <View>
            <Text className="text-base font-bold text-[#131b2e]">Order #{orderData.id}</Text>
            <Text className="text-[10px] text-[#6d7a72]">{orderData.date}</Text>
          </View>
        </View>
        <RSLogo size="sm" showText={false} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Live Delivery Status Timeline */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#eaedff]">
          <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-[#f2f3ff]">
            <View className="flex-row items-center gap-1.5">
              <Icon name="local-shipping" size={20} color="#006948" />
              <Text className="text-sm font-bold text-[#131b2e]">Live Delivery Tracking</Text>
            </View>
            <View className="bg-[#85f8c4] px-2 py-0.5 rounded-full">
              <Text className="text-[10px] text-[#002114] font-bold uppercase">{orderData.status}</Text>
            </View>
          </View>

          {/* Timeline */}
          <View className="pl-2">
            {trackingSteps.map((step, idx) => (
              <View key={step.title} className="flex-row items-start mb-3 relative">
                {idx < trackingSteps.length - 1 && (
                  <View
                    className={`absolute left-2.5 top-5 bottom-0 w-0.5 ${
                      step.completed ? 'bg-[#006948]' : 'bg-[#dae2fd]'
                    }`}
                  />
                )}
                <View
                  className={`w-5 h-5 rounded-full justify-center items-center z-10 ${
                    step.completed ? 'bg-[#006948]' : 'bg-[#e2e7ff]'
                  }`}
                >
                  <Icon name={step.completed ? 'check' : 'schedule'} size={12} color={step.completed ? '#ffffff' : '#6d7a72'} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className={`text-xs font-bold ${step.completed ? 'text-[#131b2e]' : 'text-[#6d7a72]'}`}>
                    {step.title}
                  </Text>
                  <Text className="text-[10px] text-[#6d7a72]">{step.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Assigned Dispatch Executive */}
        <View className="bg-[#e2e7ff] rounded-2xl p-3.5 mb-4 flex-row items-center justify-between shadow-sm">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-[#006948] justify-center items-center">
              <Icon name="person" size={22} color="#ffffff" />
            </View>
            <View>
              <Text className="text-xs font-bold text-[#131b2e]">{orderData.driverName}</Text>
              <Text className="text-[10px] text-[#3d4a42]">Express Delivery Representative</Text>
            </View>
          </View>
          <Pressable className="bg-[#006948] px-3 py-1.5 rounded-lg flex-row items-center gap-1 active:opacity-80">
            <Icon name="call" size={14} color="#ffffff" />
            <Text className="text-[10px] text-white font-bold">Call</Text>
          </Pressable>
        </View>

        {/* Delivery Address Snapshot */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#eaedff]">
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <Icon name="location-on" size={18} color="#006948" />
            <Text className="text-xs font-bold text-[#131b2e]">Delivery Destination (Snapshot)</Text>
          </View>
          <Text className="text-xs text-[#3d4a42] leading-relaxed">
            {orderData.deliveryAddressSnapshot?.fullAddress || orderData.deliveryAddress}
          </Text>
        </View>

        {/* Itemized Product Snapshot Breakdown */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#eaedff]">
          <Text className="text-xs font-bold text-[#131b2e] mb-3">
            Items Ordered ({orderData.items?.length || 0}) • Historical Snapshot
          </Text>

          {(orderData.items || []).map((item, idx) => {
            const itemQty = item.qty || item.quantity || 1;
            const itemPrice = item.unitPrice || item.price || (item.product?.price) || 99;
            const lineTotal = item.lineTotal || (itemPrice * itemQty);
            const subTitleText = item.subtitle || item.size || item.product?.size || '';

            return (
              <View key={item.id || item._id || idx} className="flex-row items-center justify-between py-2 border-b border-[#f2f3ff]">
                <View className="flex-1 pr-2">
                  <Text className="text-xs font-bold text-[#131b2e]">{item.name || item.product?.name || 'Product'}</Text>
                  <Text className="text-[10px] text-[#6d7a72]">
                    {subTitleText ? `${subTitleText} • ` : ''}Unit: ₹{itemPrice} • Qty: {itemQty}
                  </Text>
                </View>
                <Text className="text-xs font-extrabold text-[#131b2e]">₹{lineTotal}</Text>
              </View>
            );
          })}

          {/* Payment Financial Snapshot */}
          <View className="mt-3 pt-2 gap-1.5">
            <View className="flex-row justify-between">
              <Text className="text-xs text-[#6d7a72]">Items Subtotal</Text>
              <Text className="text-xs font-semibold text-[#131b2e]">
                ₹{orderData.financialSnapshot?.subtotal || (orderData.total - orderData.gst)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-[#6d7a72]">GST Tax (18%)</Text>
              <Text className="text-xs font-semibold text-[#131b2e]">
                ₹{orderData.financialSnapshot?.gstAmount || orderData.gst}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-[#6d7a72]">Delivery Charges</Text>
              <Text className="text-xs font-bold text-[#006948]">FREE</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-[#f2f3ff] mt-1">
              <Text className="text-sm font-bold text-[#131b2e]">Total Amount Paid</Text>
              <Text className="text-base font-extrabold text-[#006948]">
                ₹{orderData.financialSnapshot?.totalAmount || orderData.total}
              </Text>
            </View>
          </View>
        </View>

        {/* Invoice Action Button */}
        <Pressable
          onPress={handleDownloadInvoice}
          className="bg-[#006948] rounded-xl py-3.5 flex-row items-center justify-center gap-2 shadow-sm active:opacity-90"
        >
          <Icon name="receipt" size={18} color="#ffffff" />
          <Text className="text-white font-bold text-xs">Download GST Tax Invoice (PDF)</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
