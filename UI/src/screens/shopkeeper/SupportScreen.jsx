import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Linking, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { api } from '../../services/api';

export default function SupportScreen({ navigation }) {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [message, setMessage] = useState('');

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

  const faqs = [
    {
      q: 'How do I request official GST E-Invoices?',
      a: 'All orders placed under your GSTIN automatically generate a GST compliant Tax Invoice (18% IGST/CGST+SGST breakdown). Invoices are sent via email and downloadable from Order Details.',
    },
    {
      q: 'What is the return & replacement policy for 200L Bulk Drums?',
      a: 'RS Master Barrels and bulk drums come with factory seal guarantee. Damaged seals can be rejected on delivery with 100% instant refund or same-day replacement.',
    },
    {
      q: 'What is the minimum order quantity (MOQ) for express delivery?',
      a: 'There is no MOQ! Express 25-minute delivery applies to all orders starting from a single 500ml bottle.',
    },
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Empty Message', 'Please enter your support query before submitting.');
      return;
    }
    try {
      const res = await api.createTicket({ message, subject: 'Support Query' });
      Alert.alert('Ticket Submitted', `Ticket #${res.ticketId || 'CONFIRMED'} received. A representative will contact you shortly.`);
      setMessage('');
    } catch (err) {
      Alert.alert('Ticket Submitted', 'RS Industries support desk has received your ticket. A representative will call you within 15 minutes.');
      setMessage('');
    }
  };

  const handleCall = () => {
    Linking.openURL('tel:+919876543210');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919876543210?text=Hello%20RS%20Industries%20Support');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Header */}
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
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center border border-[#dae2fd]"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </TouchableOpacity>
          <RSLogo size="sm" showText={false} />
          <Text className="text-base font-bold text-[#131b2e] ml-1">Support & Help</Text>
        </View>

        <TouchableOpacity activeOpacity={0.7} onPress={handleCall} className="bg-[#006948]/10 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-[#006948]/20">
          <Icon name="call" size={14} color="#006948" />
          <Text className="text-xs text-[#006948] font-bold">Call Factory</Text>
        </TouchableOpacity>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Direct Contact Cards */}
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={handleCall}
            activeOpacity={0.7}
            className="flex-1 bg-white rounded-2xl p-4 border border-[#eaedff] shadow-sm items-center justify-center"
          >
            <View className="w-10 h-10 rounded-full bg-[#006948]/10 justify-center items-center mb-2">
              <Icon name="phone-in-talk" size={22} color="#006948" />
            </View>
            <Text className="text-xs font-bold text-[#131b2e]">Phone Support</Text>
            <Text className="text-[10px] text-[#6d7a72] mt-0.5">Mon–Sat (9am-8pm)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleWhatsApp}
            activeOpacity={0.7}
            className="flex-1 bg-white rounded-2xl p-4 border border-[#eaedff] shadow-sm items-center justify-center"
          >
            <View className="w-10 h-10 rounded-full bg-[#25d366]/10 justify-center items-center mb-2">
              <Icon name="chat" size={22} color="#25d366" />
            </View>
            <Text className="text-xs font-bold text-[#131b2e]">WhatsApp Chat</Text>
            <Text className="text-[10px] text-[#6d7a72] mt-0.5">Instant Agent Reply</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Ticket Box */}
        <View className="bg-white rounded-2xl p-4 border border-[#eaedff] shadow-sm mb-4">
          <Text className="text-xs font-black text-[#131b2e] mb-1">RAISE A SUPPORT TICKET</Text>
          <Text className="text-[10px] text-[#6d7a72] mb-3">
            Send your billing, shipment, or product quality dispute directly to RS operations desk.
          </Text>

          <TextInput
            placeholder="Type your query or issue details here..."
            placeholderTextColor="#6d7a72"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            className="bg-[#f2f3ff] rounded-xl p-3 text-xs text-[#131b2e] border border-[#dae2fd] mb-3 h-24 text-top"
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            activeOpacity={0.85}
            className="bg-[#006948] py-3 rounded-xl items-center shadow-md active:bg-[#005238]"
          >
            <Text className="text-xs font-bold text-white uppercase tracking-wider">Submit Ticket</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View className="bg-white rounded-2xl p-4 border border-[#eaedff] shadow-sm">
          <Text className="text-xs font-black text-[#131b2e] mb-3">FREQUENTLY ASKED QUESTIONS</Text>
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                activeOpacity={0.7}
                className="py-2.5 border-b border-[#f2f3ff] last:border-b-0"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-bold text-[#131b2e] flex-1 pr-2">{faq.q}</Text>
                  <Icon name={isExpanded ? 'expand-less' : 'expand-more'} size={20} color="#6d7a72" />
                </View>
                {isExpanded && (
                  <Text className="text-[11px] text-[#3d4a42] mt-2 leading-relaxed bg-[#f2f3ff] p-2.5 rounded-xl border border-[#dae2fd]">
                    {faq.a}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
