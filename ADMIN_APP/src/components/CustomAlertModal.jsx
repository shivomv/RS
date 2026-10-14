import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { registerAlertListener } from '../utils/alert';

export default function CustomAlertModal() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const unregister = registerAlertListener((alertConfig) => {
      setConfig(alertConfig);
    });
    return unregister;
  }, []);

  const closeAlert = useCallback(() => {
    setConfig(null);
  }, []);

  if (!config) return null;

  const {
    title,
    message,
    buttons = [{ text: 'OK' }],
    type = 'info',
    cancelable = true,
  } = config;

  const handleBackdropPress = () => {
    if (cancelable) {
      // If there is a cancel button, trigger its onPress
      const cancelBtn = buttons.find((b) => b?.style === 'cancel');
      if (cancelBtn?.onPress) {
        cancelBtn.onPress();
      }
      closeAlert();
    }
  };

  const handleButtonPress = (btn) => {
    closeAlert();
    if (typeof btn?.onPress === 'function') {
      btn.onPress();
    }
  };

  // Determine icon and color scheme based on type
  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: 'error-outline',
          iconColor: '#ef4444',
          badgeBg: 'bg-red-50',
          badgeBorder: 'border-red-100',
          primaryBtnBg: 'bg-red-500',
        };
      case 'success':
        return {
          icon: 'check-circle',
          iconColor: '#10b981',
          badgeBg: 'bg-emerald-50',
          badgeBorder: 'border-emerald-100',
          primaryBtnBg: 'bg-brand',
        };
      case 'warning':
        return {
          icon: 'warning-amber',
          iconColor: '#f59e0b',
          badgeBg: 'bg-amber-50',
          badgeBorder: 'border-amber-100',
          primaryBtnBg: 'bg-amber-500',
        };
      default:
        return {
          icon: 'info-outline',
          iconColor: '#006948',
          badgeBg: 'bg-emerald-50',
          badgeBorder: 'border-emerald-100',
          primaryBtnBg: 'bg-brand',
        };
    }
  };

  const typeConfig = getTypeConfig();
  const isSingleButton = buttons.length === 1;

  return (
    <Modal
      transparent
      visible={!!config}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 items-center">
              {/* Icon Badge */}
              <View
                className={`w-14 h-14 rounded-2xl justify-center items-center border ${typeConfig.badgeBg} ${typeConfig.badgeBorder}`}
              >
                <Icon name={typeConfig.icon} size={30} color={typeConfig.iconColor} />
              </View>

              {/* Title */}
              {title ? (
                <Text className="text-base font-black text-slate-900 text-center mt-4 tracking-wide">
                  {title}
                </Text>
              ) : null}

              {/* Message */}
              {message ? (
                <Text className="text-xs font-semibold text-slate-600 text-center mt-2 leading-relaxed px-2">
                  {message}
                </Text>
              ) : null}

              {/* Buttons */}
              {isSingleButton ? (
                <Pressable
                  onPress={() => handleButtonPress(buttons[0])}
                  className={`w-full mt-6 py-3.5 rounded-2xl ${typeConfig.primaryBtnBg} items-center active:opacity-85 shadow-sm`}
                >
                  <Text className="text-white font-extrabold text-sm tracking-wide">
                    {buttons[0].text || 'OK'}
                  </Text>
                </Pressable>
              ) : (
                <View className="flex-row gap-3 w-full mt-6">
                  {buttons.map((btn, idx) => {
                    const isCancel = btn.style === 'cancel';
                    const isDestructive = btn.style === 'destructive';

                    let btnContainerClass = 'flex-1 py-3.5 rounded-2xl items-center active:opacity-80';
                    let btnTextClass = 'font-black text-sm tracking-wide';

                    if (isCancel) {
                      btnContainerClass += ' bg-slate-100 border border-slate-200';
                      btnTextClass += ' text-slate-700';
                    } else if (isDestructive) {
                      btnContainerClass += ' bg-red-500 shadow-sm';
                      btnTextClass += ' text-white';
                    } else {
                      btnContainerClass += ` ${typeConfig.primaryBtnBg} shadow-sm`;
                      btnTextClass += ' text-white';
                    }

                    return (
                      <Pressable
                        key={idx}
                        onPress={() => handleButtonPress(btn)}
                        className={btnContainerClass}
                      >
                        <Text className={btnTextClass}>{btn.text}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
