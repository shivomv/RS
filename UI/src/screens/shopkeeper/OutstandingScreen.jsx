import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../services/api';

const OutstandingScreen = ({ navigation }) => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView className="flex-1 px-5">
        <View className="py-4">
          <Text className="text-xs tracking-widest font-bold text-slate-500">OUTSTANDING</Text>
          <Text className="text-2xl font-black text-slate-950 mt-1">ACCOUNT BALANCE</Text>
        </View>

        {/* Balance Card */}
        <View className="bg-slate-950 rounded-3xl px-6 py-8 mb-6">
          <Text className="text-xs font-bold text-slate-400 tracking-widest">CURRENT BALANCE</Text>
          <Text className="text-4xl font-black text-white mt-4">₹{totalOutstanding.toLocaleString('en-IN')}</Text>
          <Text className="text-xs font-bold text-amber-300 mt-4">
            {totalOutstanding === 0 ? 'ALL PAYMENTS UP TO DATE' : 'NET 30 B2B CREDIT ACTIVE'}
          </Text>
        </View>

        {/* Ledger Activity */}
        <View>
          <Text className="text-base font-black text-slate-950 mb-4">LEDGER ACTIVITY</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#0f172a" />
          ) : ledgers.length === 0 ? (
            <Text className="text-slate-500 text-center py-8">No transactions yet</Text>
          ) : (
            ledgers.map((l, idx) => (
              <View key={l.invoiceId || idx} className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-sm flex-row justify-between items-center">
                <View>
                  <Text className="text-xs font-bold text-slate-900">{l.invoiceId || `INV-${idx + 1}`}</Text>
                  <Text className="text-[10px] text-slate-500 mt-0.5">{l.terms || 'Net 30 Days'}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-black text-slate-950">₹{(l.amount || 0).toLocaleString('en-IN')}</Text>
                  <Text className="text-[10px] text-emerald-600 font-bold uppercase">{l.status || 'unpaid'}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OutstandingScreen;
