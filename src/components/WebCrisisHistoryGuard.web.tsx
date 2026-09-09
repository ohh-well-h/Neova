import { router } from 'expo-router';
import { useEffect } from 'react';

import { installCrisisWebGuard } from '@/services/crisisWebGuard';
import { REQUIRED_CRISIS_RESOURCES_HREF } from '@/services/crisisNavigation';

export function WebCrisisHistoryGuard({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    return installCrisisWebGuard({
      windowObject: window,
      documentObject: document,
      enforceRoute: () => router.replace(REQUIRED_CRISIS_RESOURCES_HREF),
    });
  }, [active]);

  return null;
}
