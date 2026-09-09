import * as Linking from 'expo-linking';

import { showAlert } from '@/services/alerts';

export async function openResource(url: string, actionLabel: string): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) throw new Error('unsupported');
    await Linking.openURL(url);
  } catch {
    showAlert('Could not open this resource', `Your device could not ${actionLabel}. Please try from your phone app.`);
  }
}
