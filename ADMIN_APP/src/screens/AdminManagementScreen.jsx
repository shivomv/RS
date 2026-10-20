import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { adminApi } from '../services/api';
import { useAdminAuth } from '../store/adminAuthStore';
import Alert from '../utils/alert';

export default function AdminManagementScreen() {
  const { session } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('9999');
  const [role, setRole] = useState('ADMIN');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAdmins = async () => {
    try {
      const res = await adminApi.getAdminUsers().catch(() => ({ data: [] }));
      setAdmins(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      console.warn('[AdminManagementScreen] Fetch error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async () => {
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg('Please enter admin name.');
      return;
    }
    if (!mobile || mobile.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSaving(true);
    try {
      const res = await adminApi.createAdminUser({
        name: name.trim(),
        mobile: mobile.trim(),
        pin: pin.trim() || '9999',
        role,
      });

      if (res && res.success) {
        Alert.alert('Success', 'New Admin created successfully!');
        setModalVisible(false);
        setName('');
        setMobile('');
        setPin('9999');
        fetchAdmins();
      } else {
        setErrorMsg(res?.error || 'Failed to create admin');
      }
    } catch (e) {
      setErrorMsg(e.message || 'Error creating admin');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdmin = (adminUser) => {
    if (adminUser.role === 'SUPERADMIN') {
      Alert.alert('Restricted', 'Super Admin accounts cannot be deleted.');
      return;
    }

    Alert.alert(
      'Remove Admin',
      `Are you sure you want to revoke admin access for ${adminUser.name} (${adminUser.mobile})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteAdminUser(adminUser.id);
              fetchAdmins();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const isSuperAdmin = session?.user?.role === 'SUPERADMIN';

  return (
    <View className="flex-1 bg-background">
      {/* Top Action Header */}
      <View className="px-4 py-3 bg-surface border-b border-border flex-row items-center justify-between">
        <View>
          <Text className="text-base font-black text-ink">Admin Access Control</Text>
          <Text className="text-[11px] text-muted font-bold">
            {admins.length} authorized administrator account(s)
          </Text>
        </View>

        {isSuperAdmin && (
          <Pressable
            onPress={() => setModalVisible(true)}
            className="bg-brand px-3 py-2 rounded-xl flex-row items-center gap-1.5 active:opacity-80"
          >
            <Icon name="person-add" size={16} color="#ffffff" />
            <Text className="text-xs font-black text-white">+ Add Admin</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAdmins();
            }}
            tintColor="#006948"
          />
        }
      >
        {/* Current User Session Banner */}
        <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-brand justify-center items-center">
              <Icon name="verified-user" size={22} color="#ffffff" />
            </View>
            <View>
              <Text className="text-xs font-black text-ink">{session?.user?.name || 'Admin'}</Text>
              <Text className="text-[11px] text-muted font-medium">{session?.user?.mobile}</Text>
            </View>
          </View>
          <View className="bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-full">
            <Text className="text-[10px] font-black uppercase text-brand">
              {session?.user?.role || 'ADMIN'}
            </Text>
          </View>
        </View>

        {/* Admins List */}
        <Text className="text-[11px] font-black text-faint uppercase tracking-wider mb-3">
          Authorized Admin Accounts
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#006948" className="my-8" />
        ) : admins.length === 0 ? (
          <View className="py-12 items-center">
            <Icon name="admin-panel-settings" size={40} color="#cbd5e1" />
            <Text className="text-sm text-faint font-semibold mt-3">No admin records found</Text>
          </View>
        ) : (
          admins.map((adm) => {
            const isSuper = adm.role === 'SUPERADMIN';
            return (
              <View
                key={adm.id}
                className="bg-surface rounded-2xl p-4 mb-3 border border-border shadow-sm flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <View
                    className="w-10 h-10 rounded-xl justify-center items-center"
                    style={{ backgroundColor: isSuper ? '#8b5cf615' : '#00694815' }}
                  >
                    <Icon
                      name={isSuper ? 'military-tech' : 'badge'}
                      size={22}
                      color={isSuper ? '#8b5cf6' : '#006948'}
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-black text-ink">{adm.name}</Text>
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: isSuper ? '#8b5cf615' : '#00694815' }}
                      >
                        <Text
                          className="text-[9px] font-black uppercase"
                          style={{ color: isSuper ? '#8b5cf6' : '#006948' }}
                        >
                          {adm.role}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-muted font-bold mt-0.5">{adm.mobile}</Text>
                  </View>
                </View>

                {isSuperAdmin && !isSuper && (
                  <Pressable
                    onPress={() => handleDeleteAdmin(adm)}
                    className="w-9 h-9 rounded-xl bg-red-50 justify-center items-center border border-red-200 active:opacity-70"
                  >
                    <Icon name="delete-outline" size={18} color="#ef4444" />
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Admin Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center px-4">
          <View className="bg-surface rounded-3xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Icon name="person-add" size={20} color="#006948" />
                <Text className="text-base font-black text-ink">Add New Admin</Text>
              </View>
              <Pressable
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-input justify-center items-center"
              >
                <Icon name="close" size={18} color="#64748b" />
              </Pressable>
            </View>

            {errorMsg ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <Text className="text-xs text-red-500 font-semibold">{errorMsg}</Text>
              </View>
            ) : null}

            {/* Name */}
            <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
              Full Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor="#94a3b8"
              className="bg-input rounded-2xl px-4 py-3 border border-border text-sm font-bold text-ink mb-3"
            />

            {/* Mobile */}
            <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
              Mobile Number
            </Text>
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              placeholder="10-digit mobile number"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              maxLength={10}
              className="bg-input rounded-2xl px-4 py-3 border border-border text-sm font-bold text-ink mb-3"
            />

            {/* PIN */}
            <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">
              Access PIN (Default: 9999)
            </Text>
            <TextInput
              value={pin}
              onChangeText={setPin}
              placeholder="Enter PIN"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              maxLength={6}
              className="bg-input rounded-2xl px-4 py-3 border border-border text-sm font-bold text-ink mb-4"
            />

            {/* Role Choice */}
            <Text className="text-[11px] font-bold text-muted mb-2 uppercase tracking-wider">
              Assigned Role
            </Text>
            <View className="flex-row gap-2 mb-6">
              <Pressable
                onPress={() => setRole('ADMIN')}
                className={`flex-1 py-2.5 rounded-xl border items-center ${
                  role === 'ADMIN' ? 'bg-brand border-brand' : 'bg-input border-border'
                }`}
              >
                <Text
                  className={`text-xs font-black ${
                    role === 'ADMIN' ? 'text-white' : 'text-secondary'
                  }`}
                >
                  Admin
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRole('SUPERADMIN')}
                className={`flex-1 py-2.5 rounded-xl border items-center ${
                  role === 'SUPERADMIN' ? 'bg-purple-600 border-purple-600' : 'bg-input border-border'
                }`}
              >
                <Text
                  className={`text-xs font-black ${
                    role === 'SUPERADMIN' ? 'text-white' : 'text-secondary'
                  }`}
                >
                  Super Admin
                </Text>
              </Pressable>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-input rounded-2xl py-3.5 items-center"
              >
                <Text className="text-xs font-bold text-secondary">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleCreateAdmin}
                disabled={saving}
                className="flex-1 bg-brand rounded-2xl py-3.5 items-center justify-center active:opacity-90"
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-xs font-black text-white">Save Admin</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
