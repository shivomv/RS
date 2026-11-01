import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function AuthChoiceScreen({ navigation }) {
  useEffect(() => {
    navigation.replace('Login');
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="small" color="#006948" />
    </View>
  );
}