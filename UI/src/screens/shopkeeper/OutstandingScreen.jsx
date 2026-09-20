import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LedgerSkeleton } from '../../components/Skeleton';
import { api } from '../../services/api';

const OutstandingScreen = ({ navigation }) => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    let isMounted = true;
    api.getLedgers()
      .then((data) => {
        if (isMounted) {
          setLedgers(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const totalOutstanding = ledgers.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View className="bg-white border-b border-slate-200 px-4 py-3 flex-row items-center justify-between shadow-sm z-10">
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
            className="w-9 h-9 rounded-full bg-slate-100 justify-center items-center border border-slate-200"
          >
            <Icon name="arrow-back" size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-base font-bold text-slate-900">Financial Ledger</Text>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} className="flex-1 px-5">
        <View className="py-4">
          <Text className="text-xs tracking-widest font-bold text-slate-500">OUTSTANDING</Text>
          <Text className="text-2xl font-black text-slate-950 mt-1">ACCOUNT BALANCE</Text>
        </View>

        {/* Balance Card */}
        <View className="bg-slate-950 rounded-3xl px-6 py-8 mb-6 shadow-md">
          <Text className="text-xs font-bold text-slate-400 tracking-widest">CURRENT BALANCE</Text>
          <Text className="text-4xl font-black text-white mt-4">₹{totalOutstanding.toLocaleString('en-IN')}</Text>
          <Text className="text-xs font-bold text-emerald-400 mt-4">
            {totalOutstanding === 0 ? 'ALL PAYMENTS UP TO DATE' : 'NET 30 B2B CREDIT ACTIVE'}
          </Text>
        </View>

        {/* Ledger Activity */}
        <View className="pb-8">
          <Text className="text-base font-black text-slate-950 mb-4">LEDGER ACTIVITY</Text>
          {loading ? (
            <LedgerSkeleton />
          ) : ledgers.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 border border-slate-200 items-center justify-center">
              <Icon name="receipt-long" size={32} color="#94a3b8" />
              <Text className="text-xs text-slate-500 font-bold mt-2">No transaction ledgers found</Text>
            </View>
          ) : (
            ledgers.map((l, idx) => (
              <View key={l.invoiceId || idx} className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-sm flex-row justify-between items-center">
                <View>
                  <Text className="text-xs font-bold text-slate-900">{l.invoiceId || `INV-${idx + 1}`}</Text>
                  <Text className="text-[10px] text-slate-500 mt-0.5">{l.terms || 'Net 30 Days'}</Text>
                </View>
                <Text className="text-sm font-black text-slate-900">₹{(l.amount || 0).toLocaleString('en-IN')}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OutstandingScreen;
