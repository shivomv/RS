import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { adminApi } from '../services/api';
import { TicketCardSkeleton, SkeletonList } from '../components/Skeletons';
import Alert from '../utils/alert';

export default function SupportTicketScreen({ tickets: initialTickets = [], onRefresh }) {
  const [ticketList, setTicketList] = useState(initialTickets);
  const [loading, setLoading] = useState(initialTickets.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTicketsData = async () => {
    try {
      const res = await adminApi.getTickets().catch(() => []);
      setTicketList(Array.isArray(res) ? res : (res?.data || []));
    } catch (e) {
      console.error('[SupportTicketScreen] Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTicketsData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTicketsData();
    if (typeof onRefresh === 'function') onRefresh();
  };

  const [activeView, setActiveView] = useState('list');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openTicket = (t) => { setSelectedTicket(t); setReplyText(''); setActiveView('view'); };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket?._id) { return; }
    setSubmitting(true);
    try {
      await adminApi.replyTicket(selectedTicket._id, replyText.trim());
      Alert.alert('Reply Sent', 'Response dispatched to the shopkeeper.');
      setReplyText('');
      setActiveView('list');
      if (typeof onRefresh === 'function') { onRefresh(); }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── TICKET VIEW ── */
  if (activeView === 'view' && selectedTicket) {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-surface border-b border-border px-4 py-3 flex-row items-center gap-3">
          <Pressable
            onPress={() => setActiveView('list')}
            className="w-10 h-10 rounded-2xl bg-input justify-center items-center border border-border active:opacity-70"
          >
            <Icon name="arrow-back" size={22} color="#006948" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-base font-black text-ink" numberOfLines={1}>
              Ticket: {selectedTicket.issueType || 'General Query'}
            </Text>
            <Text className="text-[10px] font-bold text-muted">Service Desk Query</Text>
          </View>
        </View>

        <ScrollView className="flex-1 p-5" contentContainerStyle={{ paddingBottom: 60 }}>
          {/* Issue Card */}
          <View className="bg-surface rounded-3xl p-5 mb-4 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-black text-ink uppercase tracking-wider">Issue Snapshot</Text>
              <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <Text className="text-xs font-black text-blue-500 uppercase">{selectedTicket.status || 'OPEN'}</Text>
              </View>
            </View>
            <Text className="text-sm font-extrabold text-ink mb-2">
              Category: {selectedTicket.issueType || 'Product Inquiry'}
            </Text>
            <Text className="text-xs text-secondary leading-relaxed mb-4">
              {selectedTicket.description || selectedTicket.message || 'No additional details specified.'}
            </Text>
            <View className="border-t border-border pt-3">
              <Text className="text-[10px] font-bold text-muted">Reported By:</Text>
              <Text className="text-xs font-black text-ink">{selectedTicket.shopkeeperName || selectedTicket.buyerName || 'Registered Account'}</Text>
              <Text className="text-xs font-bold text-brand-dim">📞 {selectedTicket.mobile || selectedTicket.contactPhone || 'N/A'}</Text>
            </View>
          </View>

          {/* Reply Box */}
          <View className="bg-surface rounded-3xl p-5 mb-5 border border-border">
            <Text className="text-xs font-black text-ink uppercase tracking-wider mb-2">Admin Response</Text>
            <TextInput
              value={replyText} onChangeText={setReplyText}
              placeholder="Type your official reply..." placeholderTextColor="#94a3b8"
              multiline numberOfLines={4}
              className="bg-input rounded-2xl p-4 text-xs font-bold text-ink border border-border min-h-[100px] mb-4"
            />
            <Pressable onPress={handleReply}
              disabled={submitting || !replyText.trim()}
              className={`rounded-2xl py-3.5 items-center justify-center flex-row gap-2 ${replyText.trim() ? 'bg-brand' : 'bg-input'}`}>
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : (
                <>
                  <Icon name="send" size={18} color={replyText.trim() ? '#fff' : '#94a3b8'} />
                  <Text className={`text-xs font-black uppercase tracking-wider ${replyText.trim() ? 'text-white' : 'text-faint'}`}>Send Reply</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ── TICKET LIST VIEW ── */
  return (
    <View className="flex-1 bg-background">
      <View className="p-4 bg-surface border-b border-border">
        <Text className="text-base font-black text-ink">Support & Service Desk</Text>
        <Text className="text-[10px] text-muted font-bold">Active Queries: {ticketList.length}</Text>
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#006948" />}
      >
        {loading ? (
          <SkeletonList Component={TicketCardSkeleton} count={4} />
        ) : ticketList.length === 0 ? (
          <View className="py-16 items-center">
            <Icon name="support-agent" size={48} color="#cbd5e1" />
            <Text className="text-sm font-bold text-faint mt-3">No support queries found</Text>
          </View>
        ) : (
          ticketList.map(t => (
            <Pressable key={t._id} onPress={() => openTicket(t)}
              className="bg-surface rounded-2xl p-4 mb-3 border border-border active:opacity-90">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-black text-ink">{t.issueType || 'General Query'}</Text>
                <View className="bg-blue-50 px-2.5 py-0.5 rounded-full">
                  <Text className="text-[10px] font-black text-blue-500 uppercase">{t.status || 'open'}</Text>
                </View>
              </View>
              <Text className="text-xs text-secondary mb-3" numberOfLines={2}>
                {t.description || t.message || 'Customer query content...'}
              </Text>
              <View className="flex-row items-center justify-between border-t border-border pt-2">
                <Text className="text-[10px] text-muted">From: {t.shopkeeperName || t.buyerName || 'Shopkeeper'}</Text>
                <Text className="text-xs font-bold text-brand">View Query →</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
