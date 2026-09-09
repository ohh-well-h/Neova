import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { env } from '@/lib/env';

export async function beginWebCheckout() {
  if (Platform.OS !== 'web') {
    throw new Error('Subscription checkout is available in Neova on the web.');
  }
  if (!env.webCheckoutUrl) {
    throw new Error('Web checkout has not been configured yet.');
  }

  let checkoutUrl: URL;
  try {
    checkoutUrl = new URL(env.webCheckoutUrl);
  } catch {
    throw new Error('The configured checkout address is invalid.');
  }

  const isLocal = checkoutUrl.hostname === 'localhost' || checkoutUrl.hostname === '127.0.0.1';
  if (checkoutUrl.protocol !== 'https:' && !isLocal) {
    throw new Error('The checkout address must use HTTPS.');
  }

  await Linking.openURL(checkoutUrl.toString());
}
