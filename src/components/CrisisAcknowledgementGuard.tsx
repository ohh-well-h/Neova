import { router, usePathname } from 'expo-router';
import { type PropsWithChildren, useEffect } from 'react';

import { WebCrisisHistoryGuard } from '@/components/WebCrisisHistoryGuard';
import { useApp } from '@/providers/AppProvider';
import {
  REQUIRED_CRISIS_RESOURCES_HREF,
  shouldBlockForSafety,
} from '@/services/crisisNavigation';

export function CrisisAcknowledgementGuard({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { requiresSafetyAcknowledgement, user } = useApp();
  const active = Boolean(user && requiresSafetyAcknowledgement);
  const blocked = shouldBlockForSafety({
    pending: requiresSafetyAcknowledgement,
    signedIn: Boolean(user),
    pathname,
  });

  useEffect(() => {
    if (blocked) router.replace(REQUIRED_CRISIS_RESOURCES_HREF);
  }, [blocked, pathname]);

  return (
    <>
      <WebCrisisHistoryGuard active={active} />
      {blocked ? null : children}
    </>
  );
}
