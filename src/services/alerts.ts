import { Alert, Platform } from 'react-native';

export function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    const browserAlert = (globalThis as typeof globalThis & { alert?: (value?: string) => void }).alert;
    if (browserAlert) browserAlert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}
