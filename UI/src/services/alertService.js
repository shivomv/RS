import { create } from 'zustand';

export const useAlertStore = create((set) => ({
  alert: null,
  showAlert: (config) => {
    set({
      alert: {
        id: Date.now(),
        title: config.title || 'Alert',
        message: config.message || '',
        type: config.type || 'info', // 'success', 'error', 'warning', 'info'
        duration: config.duration || 3000,
        buttons: config.buttons || [],
        onDismiss: config.onDismiss || null,
      },
    });
  },
  dismissAlert: () => set({ alert: null }),
}));

export const alertService = {
  success: (title, message, onDismiss) => {
    useAlertStore.getState().showAlert({
      title,
      message,
      type: 'success',
      duration: 2500,
      onDismiss,
    });
  },
  error: (title, message, onDismiss) => {
    useAlertStore.getState().showAlert({
      title,
      message,
      type: 'error',
      duration: 3500,
      onDismiss,
    });
  },
  warning: (title, message, onDismiss) => {
    useAlertStore.getState().showAlert({
      title,
      message,
      type: 'warning',
      duration: 3000,
      onDismiss,
    });
  },
  info: (title, message, onDismiss) => {
    useAlertStore.getState().showAlert({
      title,
      message,
      type: 'info',
      duration: 3000,
      onDismiss,
    });
  },
};
