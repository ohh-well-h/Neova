import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEMO_USER_ID = 'demo-user-maya';
export const DEMO_SESSION_KEY = '@neova/demo-session/v1';
export const SAFETY_PENDING_KEY_PREFIX = '@neova/safety-pending/v1/';

export function safetyPendingKey(userId: string) {
  return `${SAFETY_PENDING_KEY_PREFIX}${encodeURIComponent(userId)}`;
}

export async function getSafetyPending(userId: string) {
  return (await AsyncStorage.getItem(safetyPendingKey(userId))) === '1';
}

export async function setSafetyPending(userId: string) {
  await AsyncStorage.setItem(safetyPendingKey(userId), '1');
}

export async function clearSafetyPending(userId: string) {
  await AsyncStorage.removeItem(safetyPendingKey(userId));
}

export async function getDemoSessionActive() {
  return (await AsyncStorage.getItem(DEMO_SESSION_KEY)) === '1';
}

export async function setDemoSessionActive(active: boolean) {
  if (active) {
    await AsyncStorage.setItem(DEMO_SESSION_KEY, '1');
  } else {
    await AsyncStorage.removeItem(DEMO_SESSION_KEY);
  }
}
