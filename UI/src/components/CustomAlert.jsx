import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAlertStore } from '../services/alertService';

const alertStyles = {
  success: {
    bgColor: '#e6f7f0',
    borderColor: '#00a870',
    textColor: '#002114',
    iconColor: '#006948',
    icon: 'check-circle',
  },
  error: {
    bgColor: '#fde9e9',
    borderColor: '#ba1a1a',
    textColor: '#410e0b',
    iconColor: '#ba1a1a',
    icon: 'error',
  },
  warning: {
    bgColor: '#fff3cd',
    borderColor: '#ff9800',
    textColor: '#663200',
    iconColor: '#ff9800',
    icon: 'warning',
  },
  info: {
    bgColor: '#e3f2fd',
    borderColor: '#2196f3',
    textColor: '#01428d',
    iconColor: '#2196f3',
    icon: 'info',
  },
};

export default function CustomAlert() {
  const { alert, dismissAlert } = useAlertStore();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDismiss = React.useCallback(() => {
    if (alert?.onDismiss) {
      alert.onDismiss();
    }
    dismissAlert();
  }, [alert, dismissAlert]);

  useEffect(() => {
    if (alert) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, alert.duration);
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [alert, handleDismiss, slideAnim]);

  if (!alert) return null;

  const style = alertStyles[alert.type] || alertStyles.info;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <View
        style={{
          marginHorizontal: 12,
          marginTop: 12,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: style.borderColor,
          backgroundColor: style.bgColor,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: 12 }}>
          <Icon name={style.icon} size={22} color={style.iconColor} />
          <View style={{ flex: 1 }}>
            {alert.title && (
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: style.textColor,
                  marginBottom: 2,
                }}
              >
                {alert.title}
              </Text>
            )}
            {alert.message && (
              <Text
                style={{
                  fontSize: 12,
                  color: style.textColor,
                  lineHeight: 18,
                  opacity: 0.85,
                }}
              >
                {alert.message}
              </Text>
            )}
          </View>
        </View>
        <Pressable
          onPress={handleDismiss}
          style={{ padding: 4 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close" size={20} color={style.iconColor} />
        </Pressable>
      </View>
    </Animated.View>
  );
}
