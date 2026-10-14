import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { api } from '../../services/api';

export default function AboutUsScreen({ navigation }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCompanyDetails();
  }, []);

  const loadCompanyDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanyDetails();
      setCompany(data?.data || data);
    } catch (err) {
      console.error('[About] Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCompanyDetails();
    setRefreshing(false);
  };

  const openURL = (url) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  const openPhone = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const openEmail = (email) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {});
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
        <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
          <RSLogo size="md" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#006948" />
        </View>
      </SafeAreaView>
    );
  }

  const addr = company?.officeAddress || {};
  const social = company?.socialMedia || {};
  const fullAddress = `${addr.streetAddress || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}, ${addr.country || ''}`.replace(/^,\s*|,\s*$/g, '');

  const ContactItem = ({ icon, label, value, onPress, isLink = false }) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={`flex-row items-center gap-3 py-3 px-4 rounded-xl mb-2 ${
        onPress ? 'bg-[#006948]/5 active:bg-[#006948]/10' : 'bg-gray-50'
      }`}
    >
      <View className="w-10 h-10 rounded-full bg-[#006948]/10 justify-center items-center">
        <Icon name={icon} size={20} color="#006948" />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] text-[#3d4a42] font-bold uppercase tracking-wider">{label}</Text>
        <Text className="text-sm font-bold text-[#131b2e] mt-0.5" numberOfLines={2}>
          {value}
        </Text>
      </View>
      {isLink && <Icon name="chevron-right" size={20} color="#006948" />}
    </Pressable>
  );

  const SocialLink = ({ icon, label, url }) => (
    <Pressable
      onPress={() => openURL(url)}
      disabled={!url}
      className={`flex-1 rounded-2xl py-3 items-center justify-center ${
        url ? 'bg-[#006948] active:opacity-80' : 'bg-gray-200'
      }`}
    >
      <Icon name={icon} size={24} color={url ? '#ffffff' : '#cbd5e1'} />
      <Text className={`text-[9px] font-bold mt-1 ${url ? 'text-white' : 'text-gray-400'} text-center`}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
        <RSLogo size="md" />
        <Text className="text-xs font-bold text-[#006948]">About Us</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#006948']} />}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Company Hero */}
        <View className="bg-gradient-to-b from-[#006948] to-[#004a35] p-6 items-center">
          <View className="w-16 h-16 rounded-2xl bg-white/20 justify-center items-center mb-3">
            <Icon name="info" size={32} color="#ffffff" />
          </View>
          <Text className="text-2xl font-black text-white text-center mb-2">
            {company?.companyName || 'RS Industries'}
          </Text>
          <Text className="text-xs text-white/80 text-center px-4">
            {company?.contactPerson || 'Your trusted B2B partner'}
          </Text>
        </View>

        {/* About Description */}
        {company?.aboutDescription && (
          <View className="px-4 py-5 bg-white mx-4 mt-4 rounded-2xl shadow-sm mb-4">
            <Text className="text-[11px] font-black text-[#3d4a42] uppercase tracking-wider mb-2">
              About Our Company
            </Text>
            <Text className="text-sm text-[#131b2e] leading-relaxed">
              {company.aboutDescription}
            </Text>
          </View>
        )}

        {/* Contact Information */}
        <View className="px-4 mt-4">
          <Text className="text-[11px] font-black text-[#3d4a42] uppercase tracking-wider mb-3">
            Get In Touch
          </Text>

          {company?.email && (
            <ContactItem
              icon="email"
              label="Email"
              value={company.email}
              onPress={() => openEmail(company.email)}
              isLink
            />
          )}

          {company?.contactPhone && (
            <ContactItem
              icon="call"
              label="Phone"
              value={company.contactPhone}
              onPress={() => openPhone(company.contactPhone)}
              isLink
            />
          )}

          {company?.alternatePhone && (
            <ContactItem
              icon="phone"
              label="Alternate Phone"
              value={company.alternatePhone}
              onPress={() => openPhone(company.alternatePhone)}
              isLink
            />
          )}

          {company?.socialMedia?.whatsapp && (
            <ContactItem
              icon="whatsapp"
              label="WhatsApp"
              value={company.socialMedia.whatsapp}
              onPress={() => openPhone(company.socialMedia.whatsapp)}
              isLink
            />
          )}
        </View>

        {/* Office Address */}
        {fullAddress && fullAddress.trim() !== '' && (
          <View className="px-4 mt-4">
            <Text className="text-[11px] font-black text-[#3d4a42] uppercase tracking-wider mb-3">
              Office Location
            </Text>
            <View className="bg-white rounded-2xl p-4 shadow-sm flex-row gap-3">
              <View className="w-10 h-10 rounded-full bg-[#006948]/10 justify-center items-center">
                <Icon name="location-on" size={20} color="#006948" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#131b2e] mb-2">{fullAddress}</Text>
                {addr.city && (
                  <Text className="text-[10px] text-[#3d4a42]">
                    📍 {addr.city}, {addr.state} {addr.postalCode}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Social Media Links */}
        {Object.values(social).some((v) => v) && (
          <View className="px-4 mt-6">
            <Text className="text-[11px] font-black text-[#3d4a42] uppercase tracking-wider mb-3">
              Follow Us Online
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <SocialLink
                icon="public"
                label="Website"
                url={social.website}
              />
              <SocialLink
                icon="facebook"
                label="Facebook"
                url={social.facebook}
              />
              <SocialLink
                icon="camera"
                label="Instagram"
                url={social.instagram}
              />
              <SocialLink
                icon="tag"
                label="Twitter"
                url={social.twitter}
              />
              <SocialLink
                icon="business"
                label="LinkedIn"
                url={social.linkedin}
              />
              <SocialLink
                icon="play-circle"
                label="YouTube"
                url={social.youtube}
              />
            </View>
          </View>
        )}

        {/* Business Hours Info */}
        <View className="px-4 mt-6 mb-6">
          <View className="bg-blue-50 rounded-2xl p-4 border border-blue-200 flex-row gap-3">
            <Icon name="access-time" size={24} color="#1e40af" />
            <View className="flex-1">
              <Text className="text-xs font-black text-blue-900 mb-1">Monday - Saturday</Text>
              <Text className="text-[11px] text-blue-800">9:00 AM to 6:00 PM IST</Text>
              <Text className="text-[10px] text-blue-700 mt-1">Closed on Sundays & Public Holidays</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
