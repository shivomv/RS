import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { adminApi } from '../services/api';
import Alert from '../utils/alert';

export default function AboutManagementScreen() {
  const [company, setCompany] = useState({
    companyName: '',
    aboutDescription: '',
    email: '',
    contactPhone: '',
    alternatePhone: '',
    contactPerson: '',
    officeAddress: {
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    socialMedia: {
      website: '',
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
      whatsapp: '',
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCompanyDetails();
  }, []);

  const loadCompanyDetails = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCompanyDetails();
      if (res.success && res.data) {
        setCompany(res.data);
      }
    } catch (err) {
      console.error('[Company] Load error:', err.message);
      // If endpoint doesn't exist yet, show message but don't crash
      if (err.message.includes('not found')) {
        Alert.alert('Info', 'Company management features will be available after server restart');
      } else {
        Alert.alert('Error', 'Failed to load company details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!company.companyName?.trim()) {
      Alert.alert('Validation', 'Company name is required');
      return;
    }
    if (!company.email?.trim()) {
      Alert.alert('Validation', 'Email is required');
      return;
    }
    if (!company.contactPhone?.trim()) {
      Alert.alert('Validation', 'Contact phone is required');
      return;
    }

    try {
      setSaving(true);
      const res = await adminApi.updateCompanyDetails(company);
      if (res.success) {
        Alert.alert('Success', 'Company details updated successfully');
        setCompany(res.data);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update company details');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path, value) => {
    const keys = path.split('.');
    const newCompany = { ...company };
    let current = newCompany;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setCompany(newCompany);
  };

  const InputField = ({ label, value, placeholder, onChangeText, keyboardType = 'default', multiline = false }) => (
    <View className="mb-4">
      <Text className="text-[11px] font-black text-gray-600 uppercase tracking-wider mb-1.5">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#cbd5e1"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        className="bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 border border-gray-200"
      />
    </View>
  );

  const SectionHeader = ({ title, icon }) => (
    <View className="flex-row items-center gap-2.5 mb-4 mt-6 first:mt-0">
      <View className="w-1 h-6 bg-blue-600 rounded-full" />
      <Icon name={icon} size={20} color="#1e40af" />
      <Text className="text-base font-black text-gray-900">{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-5">
        {/* Page Header */}
        <View className="flex-row items-center gap-3 mb-6">
          <View className="w-12 h-12 rounded-2xl bg-blue-600 justify-center items-center shadow-md">
            <Icon name="info" size={24} color="#ffffff" />
          </View>
          <View>
            <Text className="text-2xl font-black text-gray-900">Company Management</Text>
            <Text className="text-xs text-gray-600 mt-1">Manage company profile and contact information</Text>
          </View>
        </View>

        {/* Basic Information */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <SectionHeader title="Basic Information" icon="business" />

          <InputField
            label="Company Name"
            value={company.companyName}
            placeholder="e.g., RS Industries"
            onChangeText={(val) => updateField('companyName', val)}
          />

          <InputField
            label="About Description"
            value={company.aboutDescription}
            placeholder="Brief company description..."
            onChangeText={(val) => updateField('aboutDescription', val)}
            multiline={true}
          />

          <InputField
            label="Contact Person"
            value={company.contactPerson}
            placeholder="e.g., Business Development Manager"
            onChangeText={(val) => updateField('contactPerson', val)}
          />
        </View>

        {/* Contact Information */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <SectionHeader title="Contact Information" icon="call" />

          <InputField
            label="Primary Email"
            value={company.email}
            placeholder="hello@company.com"
            onChangeText={(val) => updateField('email', val)}
            keyboardType="email-address"
          />

          <InputField
            label="Primary Phone"
            value={company.contactPhone}
            placeholder="+91-80-XXXX-XXXX"
            onChangeText={(val) => updateField('contactPhone', val)}
            keyboardType="phone-pad"
          />

          <InputField
            label="Alternate Phone"
            value={company.alternatePhone}
            placeholder="+91-XX-XXXX-XXXX"
            onChangeText={(val) => updateField('alternatePhone', val)}
            keyboardType="phone-pad"
          />
        </View>

        {/* Office Address */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <SectionHeader title="Office Address" icon="location-on" />

          <InputField
            label="Street Address"
            value={company.officeAddress.streetAddress}
            placeholder="Plot number, building name, street"
            onChangeText={(val) => updateField('officeAddress.streetAddress', val)}
          />

          <View className="grid grid-cols-2 gap-3 mb-4">
            <View>
              <Text className="text-[11px] font-black text-gray-600 uppercase tracking-wider mb-1.5">City</Text>
              <TextInput
                value={company.officeAddress.city}
                onChangeText={(val) => updateField('officeAddress.city', val)}
                placeholder="City"
                placeholderTextColor="#cbd5e1"
                className="bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 border border-gray-200"
              />
            </View>
            <View>
              <Text className="text-[11px] font-black text-gray-600 uppercase tracking-wider mb-1.5">State</Text>
              <TextInput
                value={company.officeAddress.state}
                onChangeText={(val) => updateField('officeAddress.state', val)}
                placeholder="State"
                placeholderTextColor="#cbd5e1"
                className="bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 border border-gray-200"
              />
            </View>
          </View>

          <View className="grid grid-cols-2 gap-3 mb-4">
            <View>
              <Text className="text-[11px] font-black text-gray-600 uppercase tracking-wider mb-1.5">Postal Code</Text>
              <TextInput
                value={company.officeAddress.postalCode}
                onChangeText={(val) => updateField('officeAddress.postalCode', val)}
                placeholder="560038"
                placeholderTextColor="#cbd5e1"
                keyboardType="numeric"
                className="bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 border border-gray-200"
              />
            </View>
            <View>
              <Text className="text-[11px] font-black text-gray-600 uppercase tracking-wider mb-1.5">Country</Text>
              <TextInput
                value={company.officeAddress.country}
                onChangeText={(val) => updateField('officeAddress.country', val)}
                placeholder="Country"
                placeholderTextColor="#cbd5e1"
                className="bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-900 border border-gray-200"
              />
            </View>
          </View>
        </View>

        {/* Social Media & Web */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <SectionHeader title="Social Media & Web" icon="public" />

          <InputField
            label="Website URL"
            value={company.socialMedia.website}
            placeholder="https://www.company.com"
            onChangeText={(val) => updateField('socialMedia.website', val)}
            keyboardType="url"
          />

          <InputField
            label="Facebook URL"
            value={company.socialMedia.facebook}
            placeholder="https://facebook.com/company"
            onChangeText={(val) => updateField('socialMedia.facebook', val)}
            keyboardType="url"
          />

          <InputField
            label="Instagram URL"
            value={company.socialMedia.instagram}
            placeholder="https://instagram.com/company"
            onChangeText={(val) => updateField('socialMedia.instagram', val)}
            keyboardType="url"
          />

          <InputField
            label="Twitter/X URL"
            value={company.socialMedia.twitter}
            placeholder="https://twitter.com/company"
            onChangeText={(val) => updateField('socialMedia.twitter', val)}
            keyboardType="url"
          />

          <InputField
            label="LinkedIn URL"
            value={company.socialMedia.linkedin}
            placeholder="https://linkedin.com/company/company"
            onChangeText={(val) => updateField('socialMedia.linkedin', val)}
            keyboardType="url"
          />

          <InputField
            label="YouTube URL"
            value={company.socialMedia.youtube}
            placeholder="https://youtube.com/@company"
            onChangeText={(val) => updateField('socialMedia.youtube', val)}
            keyboardType="url"
          />

          <InputField
            label="WhatsApp Business"
            value={company.socialMedia.whatsapp}
            placeholder="+91-98765-43210"
            onChangeText={(val) => updateField('socialMedia.whatsapp', val)}
            keyboardType="phone-pad"
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-8">
          <Pressable
            onPress={loadCompanyDetails}
            className="flex-1 bg-gray-200 rounded-xl py-3 items-center justify-center flex-row gap-2 active:opacity-80"
          >
            <Icon name="refresh" size={18} color="#374151" />
            <Text className="text-sm font-bold text-gray-900">Reset</Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 rounded-xl py-3 items-center justify-center flex-row gap-2 active:opacity-90"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Icon name="save" size={18} color="#ffffff" />
                <Text className="text-sm font-bold text-white">Save Changes</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
