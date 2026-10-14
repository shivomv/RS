import { Alert as RNAlert } from 'react-native';

// Global subscriber listener for CustomAlertModal
let alertListener = null;

export const registerAlertListener = (listener) => {
  alertListener = listener;
  return () => {
    if (alertListener === listener) {
      alertListener = null;
    }
  };
};

/**
 * Determine alert semantic type if not explicitly supplied
 */
const detectType = (title = '', buttons = []) => {
  const lower = String(title).toLowerCase();
  if (
    lower.includes('error') ||
    lower.includes('failed') ||
    lower.includes('invalid') ||
    lower.includes('unable')
  ) {
    return 'error';
  }
  if (
    lower.includes('success') ||
    lower.includes('updated') ||
    lower.includes('saved') ||
    lower.includes('published') ||
    lower.includes('created') ||
    lower.includes('sent') ||
    lower.includes('added')
  ) {
    return 'success';
  }
  if (
    lower.includes('delete') ||
    lower.includes('remove') ||
    lower.includes('cancel') ||
    lower.includes('warning') ||
    lower.includes('logout')
  ) {
    return 'warning';
  }
  const hasDestructive = buttons?.some((b) => b?.style === 'destructive');
  if (hasDestructive) return 'warning';

  return 'info';
};

/**
 * Main custom alert function - drop-in replacement for React Native's Alert.alert
 *
 * @param {string} title - Alert title
 * @param {string} message - Alert description / message
 * @param {Array<{ text: string, onPress?: () => void, style?: 'default' | 'cancel' | 'destructive' }>} buttons
 * @param {Object} options - { type?: 'success' | 'error' | 'warning' | 'info', cancelable?: boolean }
 */
export const customAlert = (title, message, buttons, options = {}) => {
  const resolvedButtons =
    Array.isArray(buttons) && buttons.length > 0
      ? buttons
      : [{ text: 'OK', style: 'default' }];

  const resolvedType = options.type || detectType(title, resolvedButtons);

  if (alertListener) {
    alertListener({
      title: title || '',
      message: message ? String(message) : '',
      buttons: resolvedButtons,
      type: resolvedType,
      cancelable: options.cancelable !== false,
    });
  } else {
    // Fallback if modal is unmounted
    console.warn('[CustomAlert] Listener not registered yet. Falling back to RN Alert.');
    RNAlert.alert(title, message, resolvedButtons, options);
  }
};

/**
 * Convenient shorthand helpers
 */
export const showError = (title, message, onOk) => {
  customAlert(
    title || 'Error',
    message,
    [{ text: 'OK', onPress: onOk }],
    { type: 'error' }
  );
};

export const showSuccess = (title, message, onOk) => {
  customAlert(
    title || 'Success',
    message,
    [{ text: 'OK', onPress: onOk }],
    { type: 'success' }
  );
};

export const showConfirm = (
  title,
  message,
  onConfirm,
  onCancel,
  {
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    destructive = false,
  } = {}
) => {
  customAlert(
    title,
    message,
    [
      { text: cancelText, style: 'cancel', onPress: onCancel },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ],
    { type: destructive ? 'warning' : 'info' }
  );
};

// Drop-in Alert object matching React Native's Alert API
const Alert = {
  alert: customAlert,
  error: showError,
  success: showSuccess,
  confirm: showConfirm,
};

export default Alert;
