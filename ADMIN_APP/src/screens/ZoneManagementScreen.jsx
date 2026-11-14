import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { adminApi } from '../services/api';

export default function ZoneManagementScreen() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'PAUSED'

  // Modal / Form state
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('');
  const [hubName, setHubName] = useState('Kanpur Central Hub');
  const [estimatedDays, setEstimatedDays] = useState('Same Day / Next Day');
  const [isServiceable, setIsServiceable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingPin, setFetchingPin] = useState(false);

  // Bulk state
  const [bulkPincodes, setBulkPincodes] = useState('');
  const [bulkCity, setBulkCity] = useState('Kanpur');
  const [bulkState, setBulkState] = useState('Uttar Pradesh');
  const [bulkHub, setBulkHub] = useState('Kanpur Central Hub');
  const [bulkDays, setBulkDays] = useState('Same Day / Next Day');
  const [bulkSaving, setBulkSaving] = useState(false);

  const fetchZones = async () => {
    try {
      const res = await adminApi.getDeliveryZones();
      const list = Array.isArray(res?.zones) ? res.zones : Array.isArray(res) ? res : [];
      setZones(list);
    } catch (err) {
      console.error('[ZoneManagement] Fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchZones();
  };

  const openAddModal = () => {
    setIsEditing(false);
    setPincode('');
    setCity('');
    setState('Uttar Pradesh');
    setDistrict('');
    setHubName('Kanpur Central Hub');
    setEstimatedDays('Same Day / Next Day');
    setIsServiceable(true);
    setModalVisible(true);
  };

  const openEditModal = (zone) => {
    setIsEditing(true);
    setPincode(zone.pincode);
    setCity(zone.city || '');
    setState(zone.state || 'Uttar Pradesh');
    setDistrict(zone.district || zone.city || '');
    setHubName(zone.hubName || 'Kanpur Central Hub');
    setEstimatedDays(zone.estimatedDays || 'Same Day / Next Day');
    setIsServiceable(Boolean(zone.isServiceable));
    setModalVisible(true);
  };

  // Auto-fetch City & State when admin types 6-digit Pincode
  const handlePincodeChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);

    if (clean.length === 6 && !isEditing) {
      setFetchingPin(true);
      try {
        const res = await adminApi.getPincodeInfo(clean);
        if (res && res.success) {
          if (res.city) setCity(res.city);
          if (res.state) setState(res.state);
          if (res.district) setDistrict(res.district);
          if (res.hubName) setHubName(res.hubName);
        }
      } catch (err) {
        console.warn('[Pincode Lookup error]:', err.message);
      } finally {
        setFetchingPin(false);
      }
    }
  };

  // Quick Toggle Active/Paused Status
  const handleToggleStatus = async (zone) => {
    const nextStatus = !zone.isServiceable;
    try {
      // Optimistic update in UI
      setZones((prev) =>
        prev.map((z) => (z.pincode === zone.pincode ? { ...z, isServiceable: nextStatus } : z))
      );

      await adminApi.addOrUpdateZone({
        pincode: zone.pincode,
        city: zone.city,
        state: zone.state,
        district: zone.district,
        hubName: zone.hubName,
        estimatedDays: zone.estimatedDays,
        isServiceable: nextStatus,
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update zone status');
      fetchZones();
    }
  };

  const handleSaveZone = async () => {
    const cleanPin = pincode.replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length !== 6) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit Indian pincode.');
      return;
    }

    if (!city.trim()) {
      Alert.alert('City Required', 'Please specify the city/region name.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        pincode: cleanPin,
        city: city.trim(),
        state: state.trim() || 'Uttar Pradesh',
        district: district.trim() || city.trim(),
        hubName: hubName.trim() || 'Main Hub',
        estimatedDays: estimatedDays.trim() || '1-2 Days',
        isServiceable,
      };

      await adminApi.addOrUpdateZone(payload);
      setModalVisible(false);
      fetchZones();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save delivery zone');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = (zone) => {
    Alert.alert(
      'Delete Delivery Pincode',
      `Are you sure you want to remove pincode ${zone.pincode} (${zone.city}) from RS Industries delivery network?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteZone(zone.pincode);
              setZones((prev) => prev.filter((z) => z.pincode !== zone.pincode));
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete pincode');
            }
          },
        },
      ]
    );
  };

  // Bulk Import Pincodes
  const handleSaveBulk = async () => {
    const rawList = bulkPincodes
      .split(/[\s,;\n]+/)
      .map((p) => p.replace(/\D/g, '').slice(0, 6))
      .filter((p) => p.length === 6);

    const uniquePins = [...new Set(rawList)];

    if (uniquePins.length === 0) {
      Alert.alert('No Valid Pincodes', 'Please paste at least one valid 6-digit pincode.');
      return;
    }

    setBulkSaving(true);
    try {
      for (const pin of uniquePins) {
        await adminApi.addOrUpdateZone({
          pincode: pin,
          city: bulkCity.trim() || 'Kanpur',
          state: bulkState.trim() || 'Uttar Pradesh',
          district: bulkCity.trim(),
          hubName: bulkHub.trim() || 'Kanpur Central Hub',
          estimatedDays: bulkDays.trim() || 'Same Day / Next Day',
          isServiceable: true,
        });
      }

      setBulkModalVisible(false);
      setBulkPincodes('');
      Alert.alert('Success', `Successfully configured ${uniquePins.length} delivery pincodes.`);
      fetchZones();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed during bulk import');
    } finally {
      setBulkSaving(false);
    }
  };

  // Filtered List
  const filteredZones = zones.filter((z) => {
    const matchesSearch =
      !search ||
      String(z.pincode).includes(search) ||
      String(z.city || '').toLowerCase().includes(search.toLowerCase()) ||
      String(z.district || '').toLowerCase().includes(search.toLowerCase()) ||
      String(z.hubName || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && z.isServiceable) ||
      (filterStatus === 'PAUSED' && !z.isServiceable);

    return matchesSearch && matchesStatus;
  });

  const activeCount = zones.filter((z) => z.isServiceable).length;
  const pausedCount = zones.length - activeCount;

  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* Top Action & Metric Header */}
      <View className="bg-white px-4 py-3 border-b border-[#e2e8f0] shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1 mr-2">
            <Text className="text-base font-black text-[#0f172a]">Delivery Pincodes & Zones</Text>
            <Text className="text-[11px] text-[#64748b]" numberOfLines={1}>
              Configure serviceable wholesale territories
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Pressable
              onPress={() => setBulkModalVisible(true)}
              className="bg-[#eef2ff] border border-[#c7d2fe] px-2.5 py-1.5 rounded-xl flex-row items-center gap-1 active:opacity-75"
            >
              <Icon name="playlist-add" size={15} color="#3730a3" />
              <Text className="text-[11px] font-bold text-[#3730a3]">Bulk</Text>
            </Pressable>
            <Pressable
              onPress={openAddModal}
              className="bg-[#006948] px-3 py-1.5 rounded-xl flex-row items-center gap-1 active:opacity-85 shadow-sm"
            >
              <Icon name="add" size={16} color="#ffffff" />
              <Text className="text-[11px] font-bold text-white uppercase">Add</Text>
            </Pressable>
          </View>
        </View>

        {/* 3 Metrics Pills */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1 bg-[#f1f5f9] p-2.5 rounded-xl border border-[#e2e8f0]">
            <Text className="text-[10px] text-[#64748b] font-bold uppercase">Total Zones</Text>
            <Text className="text-base font-black text-[#0f172a] mt-0.5">{zones.length}</Text>
          </View>
          <View className="flex-1 bg-[#ecfdf5] p-2.5 rounded-xl border border-[#a7f3d0]">
            <Text className="text-[10px] text-[#065f46] font-bold uppercase">Active</Text>
            <Text className="text-base font-black text-[#047857] mt-0.5">{activeCount}</Text>
          </View>
          <View className="flex-1 bg-[#fff1f2] p-2.5 rounded-xl border border-[#fecdd3]">
            <Text className="text-[10px] text-[#9f1239] font-bold uppercase">Paused</Text>
            <Text className="text-base font-black text-[#e11d48] mt-0.5">{pausedCount}</Text>
          </View>
        </View>

        {/* Search & Status Filters */}
        <View className="mt-3 flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center bg-[#f1f5f9] rounded-xl px-3 h-10 border border-[#e2e8f0]">
            <Icon name="search" size={18} color="#64748b" />
            <TextInput
              placeholder="Search pincode or city..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              className="flex-1 ml-2 text-xs font-semibold text-[#0f172a]"
            />
            {search ? (
              <Pressable onPress={() => setSearch('')}>
                <Icon name="close" size={16} color="#94a3b8" />
              </Pressable>
            ) : null}
          </View>

          <View className="flex-row bg-[#f1f5f9] rounded-xl p-0.5 border border-[#e2e8f0]">
            {['ALL', 'ACTIVE', 'PAUSED'].map((st) => (
              <Pressable
                key={st}
                onPress={() => setFilterStatus(st)}
                className={`px-2.5 py-1.5 rounded-lg ${
                  filterStatus === st ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Text
                  className={`text-[10px] font-bold ${
                    filterStatus === st ? 'text-[#006948]' : 'text-[#64748b]'
                  }`}
                >
                  {st}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Pincode List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#006948" />
          <Text className="text-xs text-[#64748b] mt-2 font-semibold">Loading delivery zones...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-3"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {filteredZones.length === 0 ? (
            <View className="bg-white p-8 rounded-2xl border border-dashed border-[#cbd5e1] items-center justify-center mt-6">
              <Icon name="location-off" size={40} color="#94a3b8" />
              <Text className="text-sm font-bold text-[#0f172a] mt-2">No Delivery Zones Found</Text>
              <Text className="text-xs text-[#64748b] text-center mt-1">
                {search ? 'No pincodes matched your search filter.' : 'Click "Add Pincode" to configure your first delivery zone.'}
              </Text>
            </View>
          ) : (
            filteredZones.map((zone) => (
              <View
                key={zone.pincode}
                className="bg-white rounded-2xl p-4 mb-2.5 border border-[#e2e8f0] shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`w-10 h-10 rounded-xl justify-center items-center ${
                        zone.isServiceable ? 'bg-[#ecfdf5]' : 'bg-[#fff1f2]'
                      }`}
                    >
                      <Icon
                        name={zone.isServiceable ? 'local-shipping' : 'location-off'}
                        size={22}
                        color={zone.isServiceable ? '#059669' : '#e11d48'}
                      />
                    </View>
                    <View>
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-base font-black text-[#0f172a]">{zone.pincode}</Text>
                        <View
                          className={`px-2 py-0.2 rounded-full border ${
                            zone.isServiceable
                              ? 'bg-[#ecfdf5] border-[#a7f3d0]'
                              : 'bg-[#fff1f2] border-[#fecdd3]'
                          }`}
                        >
                          <Text
                            className={`text-[9.5px] font-bold uppercase tracking-wider ${
                              zone.isServiceable ? 'text-[#047857]' : 'text-[#e11d48]'
                            }`}
                          >
                            {zone.isServiceable ? 'Serviceable' : 'Paused'}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs font-semibold text-[#475569]">
                        {zone.city}, {zone.state} {zone.district ? `(${zone.district})` : ''}
                      </Text>
                    </View>
                  </View>

                  {/* Toggle Switch */}
                  <Switch
                    value={Boolean(zone.isServiceable)}
                    onValueChange={() => handleToggleStatus(zone)}
                    trackColor={{ false: '#cbd5e1', true: '#a7f3d0' }}
                    thumbColor={zone.isServiceable ? '#059669' : '#94a3b8'}
                  />
                </View>

                {/* Hub & Timeline details */}
                <View className="bg-[#f8fafc] rounded-xl p-2.5 flex-row items-center justify-between mt-1">
                  <View className="flex-1 mr-2">
                    <Text className="text-[10px] text-[#64748b] uppercase font-bold">Assigned Hub</Text>
                    <Text className="text-xs font-bold text-[#1e293b]" numberOfLines={1}>
                      {zone.hubName || 'Default Warehouse'}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[10px] text-[#64748b] uppercase font-bold">Delivery Time</Text>
                    <Text className="text-xs font-bold text-[#006948]">
                      {zone.estimatedDays || '1-2 Days'}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row items-center justify-end gap-3 mt-3 pt-2.5 border-t border-[#f1f5f9]">
                  <Pressable
                    onPress={() => openEditModal(zone)}
                    className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f1f5f9] active:bg-[#e2e8f0]"
                  >
                    <Icon name="edit" size={15} color="#334155" />
                    <Text className="text-xs font-bold text-[#334155]">Edit</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteZone(zone)}
                    className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-[#fff1f2] active:bg-[#ffe4e6]"
                  >
                    <Icon name="delete-outline" size={15} color="#e11d48" />
                    <Text className="text-xs font-bold text-[#e11d48]">Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Add / Edit Pincode Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-3xl p-5 border-t border-[#dae2fd] max-h-[85%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <Text className="text-base font-black text-[#0f172a]">
                {isEditing ? 'Edit Delivery Zone' : 'Add Delivery Pincode'}
              </Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] justify-center items-center"
              >
                <Icon name="close" size={18} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
              {/* Pincode Input */}
              <View className="mb-3">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-xs font-bold text-[#0f172a]">6-Digit PIN Code *</Text>
                  {fetchingPin && <ActivityIndicator size="small" color="#006948" />}
                </View>
                <TextInput
                  placeholder="e.g. 208001"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!isEditing}
                  value={pincode}
                  onChangeText={handlePincodeChange}
                  className={`rounded-xl px-3 h-11 text-xs font-bold text-[#0f172a] border ${
                    isEditing ? 'bg-[#f1f5f9] border-[#cbd5e1]' : 'bg-[#f8fafc] border-[#cbd5e1]'
                  }`}
                />
              </View>

              {/* City & State */}
              <View className="flex-row gap-2 mb-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#0f172a] mb-1.5">City / Region *</Text>
                  <TextInput
                    placeholder="e.g. Kanpur"
                    placeholderTextColor="#94a3b8"
                    value={city}
                    onChangeText={setCity}
                    className="bg-[#f8fafc] rounded-xl px-3 h-11 text-xs font-bold text-[#0f172a] border border-[#cbd5e1]"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#0f172a] mb-1.5">State</Text>
                  <TextInput
                    placeholder="e.g. Uttar Pradesh"
                    placeholderTextColor="#94a3b8"
                    value={state}
                    onChangeText={setState}
                    className="bg-[#f8fafc] rounded-xl px-3 h-11 text-xs font-bold text-[#0f172a] border border-[#cbd5e1]"
                  />
                </View>
              </View>

              {/* District & Assigned Hub */}
              <View className="mb-3">
                <Text className="text-xs font-bold text-[#0f172a] mb-1.5">Assigned Warehouse / Hub Name</Text>
                <TextInput
                  placeholder="e.g. Kanpur Central Hub, Panki Hub"
                  placeholderTextColor="#94a3b8"
                  value={hubName}
                  onChangeText={setHubName}
                  className="bg-[#f8fafc] rounded-xl px-3 h-11 text-xs font-bold text-[#0f172a] border border-[#cbd5e1]"
                />
              </View>

              {/* Estimated Delivery Time */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-[#0f172a] mb-1.5">Estimated Delivery Timeline</Text>
                <TextInput
                  placeholder="e.g. Same Day, 1-2 Days"
                  placeholderTextColor="#94a3b8"
                  value={estimatedDays}
                  onChangeText={setEstimatedDays}
                  className="bg-[#f8fafc] rounded-xl px-3 h-11 text-xs font-bold text-[#0f172a] border border-[#cbd5e1]"
                />
              </View>

              {/* Active Toggle */}
              <View className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0] flex-row items-center justify-between mb-5">
                <View>
                  <Text className="text-xs font-bold text-[#0f172a]">Serviceable Active Status</Text>
                  <Text className="text-[11px] text-[#64748b]">
                    Enable or pause deliveries to this pincode
                  </Text>
                </View>
                <Switch
                  value={isServiceable}
                  onValueChange={setIsServiceable}
                  trackColor={{ false: '#cbd5e1', true: '#a7f3d0' }}
                  thumbColor={isServiceable ? '#059669' : '#94a3b8'}
                />
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleSaveZone}
                disabled={saving}
                className="bg-[#006948] rounded-xl py-3.5 items-center justify-center active:opacity-90 shadow-sm"
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white text-xs font-bold uppercase tracking-wider">
                    {isEditing ? 'Update Zone' : 'Save Delivery Zone'}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bulk Pincode Modal */}
      <Modal visible={bulkModalVisible} transparent animationType="slide" onRequestClose={() => setBulkModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-3xl p-5 border-t border-[#dae2fd] max-h-[85%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <Text className="text-base font-black text-[#0f172a]">Bulk Import Delivery Pincodes</Text>
              <Pressable
                onPress={() => setBulkModalVisible(false)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] justify-center items-center"
              >
                <Icon name="close" size={18} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
              <Text className="text-xs text-[#475569] mb-2 leading-relaxed">
                Paste multiple 6-digit pincodes separated by comma, space, or newline:
              </Text>
              <TextInput
                placeholder="e.g. 208001, 208002, 208003, 208004, 208005"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={bulkPincodes}
                onChangeText={setBulkPincodes}
                className="bg-[#f8fafc] rounded-xl p-3 text-xs font-bold text-[#0f172a] border border-[#cbd5e1] min-h-[90px] mb-3"
              />

              <View className="flex-row gap-2 mb-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#0f172a] mb-1.5">City</Text>
                  <TextInput
                    value={bulkCity}
                    onChangeText={setBulkCity}
                    className="bg-[#f8fafc] rounded-xl px-3 h-11 text-xs font-bold text-[#0f172a] border border-[#cbd5e1]"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#0f172a] mb-1.5">State</Text>
                  <TextInput
                    value={bulkState}
                    onChangeText={setBulkState}
                    className="bg-[#f8fafc] rounded-xl px-3 h-11 text-xs font-bold text-[#0f172a] border border-[#cbd5e1]"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-xs font-bold text-[#0f172a] mb-1.5">Hub Name</Text>
                <TextInput
                  value={bulkHub}
                  onChangeText={setBulkHub}
                  className="bg-[#f8fafc] rounded-xl px-3 h-11 text-xs font-bold text-[#0f172a] border border-[#cbd5e1]"
                />
              </View>

              <Pressable
                onPress={handleSaveBulk}
                disabled={bulkSaving}
                className="bg-[#006948] rounded-xl py-3.5 items-center justify-center active:opacity-90 shadow-sm"
              >
                {bulkSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white text-xs font-bold uppercase tracking-wider">
                    Import All Pincodes
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
