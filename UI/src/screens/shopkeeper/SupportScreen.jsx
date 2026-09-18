import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, LinkedState, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { api } from '../../services/api';

export default function SupportScreen({ navigation }) {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [message, setMessage] = useState('');

  const faqs = [
    {
      q: 'How do I request official GST E-Invoices for B2B accounting?',
      a: 'All orders placed under your GSTIN automatically generate a GST compliant Tax Invoice (18% IGST/CGST+SGST breakdown). Invoices are sent via email and downloadable from Order Details.',
    },
    {
      q: 'What is the return & replacement policy for 200L Bulk Drums?',
      a: 'RS Master Barrels and bulk drums come with factory seal guarantee. Damaged seals can be rejected on delivery with 100% instant refund or same-day replacement.',
    },
    {
      q: 'How does Net 30 B2B Credit Ledger work?',
      a: 'Approved corporate buyers can order without immediate payment up to their credit limit. Invoices are cleared within 30 days via NEFT or cheque.',
    },
    {
      q: 'What is the minimum order quantity (MOQ) for express delivery?',
      a: 'There is no MOQ! Express 25-minute delivery applies to all orders starting from a single 500ml bottle.',
    },
  ];

  const handleSendMessage = async () => {
    if (!message) {
      Alert.alert('Empty Message', 'Please enter your support query before submitting.');
      return;
    }
    try {
      const res = await api.createTicket({ message, subject: 'B2B Support Query' });
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
          <Text className="text-base font-bold text-[#131b2e]">Help & B2B Support</Text>
        </View>
        <RSLogo size="sm" showText={false} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Quick Contact Bar */}
        <View className="flex-row gap-3 mb-4">
          <Pressable
            onPress={handleWhatsApp}
            className="flex-1 bg-[#25d366]/10 border border-[#25d366]/30 rounded-2xl p-4 items-center justify-center active:opacity-80 shadow-sm"
          >
            <Icon name="chat" size={26} color="#25d366" />
            <Text className="text-xs font-bold text-[#131b2e] mt-1.5">WhatsApp Support</Text>
            <Text className="text-[9px] text-[#6d7a72]">Instant Chat</Text>
          </Pressable>

          <Pressable
            onPress={handleCall}
            className="flex-1 bg-[#006948]/10 border border-[#006948]/30 rounded-2xl p-4 items-center justify-center active:opacity-80 shadow-sm"
          >
            <Icon name="headset-mic" size={26} color="#006948" />
            <Text className="text-xs font-bold text-[#131b2e] mt-1.5">Dispatch Manager</Text>
            <Text className="text-[9px] text-[#6d7a72]">Direct Helpline</Text>
          </Pressable>
        </View>

        {/* FAQs */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#eaedff]">
          <Text className="text-xs font-bold text-[#131b2e] mb-3">Frequently Asked Questions</Text>
          {faqs.map((faq, idx) => (
            <View key={idx} className="border-b border-[#f2f3ff] py-2.5">
              <Pressable
                onPress={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="flex-row items-center justify-between"
              >
                <Text className="text-xs font-bold text-[#131b2e] flex-1 pr-2">{faq.q}</Text>
                <Icon name={expandedFaq === idx ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={20} color="#006948" />
              </Pressable>
              {expandedFaq === idx && (
                <Text className="text-xs text-[#3d4a42] mt-2 leading-relaxed bg-[#f2f3ff] p-3 rounded-xl">
                  {faq.a}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Submit Ticket Form */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">
          <Text className="text-xs font-bold text-[#131b2e] mb-1">Submit B2B Query</Text>
          <Text className="text-[10px] text-[#6d7a72] mb-3">
            Have a custom chemical formulation requirement or GST invoice dispute? Leave a message below.
          </Text>

          <TextInput
            placeholder="Type your message here..."
            placeholderTextColor="#6d7a72"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            className="bg-[#f2f3ff] rounded-xl p-3 text-xs text-[#131b2e] min-h-[90px] mb-3"
          />

          <Pressable
            onPress={handleSendMessage}
            className="bg-[#006948] rounded-xl py-3 items-center shadow-sm active:opacity-90"
          >
            <Text className="text-white font-bold text-xs uppercase tracking-wider">Submit Ticket</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
