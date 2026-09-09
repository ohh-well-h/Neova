import {
  CRISIS_RESOURCES_ROOT_ID,
  REQUIRED_CRISIS_RESOURCES_HREF,
} from '@/services/crisisNavigation';

type BrowserGuardOptions = {
  windowObject: Window;
  documentObject: Document;
  enforceRoute: () => void;
};

export function installCrisisWebGuard({
  windowObject,
  documentObject,
  enforceRoute,
}: BrowserGuardOptions) {
  const routeIsCanonical = () =>
    windowObject.location.pathname === '/crisis-resources' &&
    new URLSearchParams(windowObject.location.search).get('required') === '1';
  const enforce = (pushHistory: boolean) => {
    if (pushHistory || !routeIsCanonical()) {
      windowObject.history.pushState(
        { ...windowObject.history.state, neovaSafetyGuard: true },
        '',
        REQUIRED_CRISIS_RESOURCES_HREF,
      );
    }
    enforceRoute();
  };

  const handlePopState = () => enforce(true);
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    enforce(false);
  };
  const handlePointerDown = (event: PointerEvent) => {
    const resourcesRoot = documentObject.getElementById(CRISIS_RESOURCES_ROOT_ID);
    if (resourcesRoot && event.target instanceof Node && resourcesRoot.contains(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    enforce(false);
  };

  if (!routeIsCanonical()) {
    enforce(true);
  } else {
    windowObject.history.replaceState(
      { ...windowObject.history.state, neovaSafetyGuard: true },
      '',
      REQUIRED_CRISIS_RESOURCES_HREF,
    );
  }

  windowObject.addEventListener('popstate', handlePopState);
  windowObject.addEventListener('keydown', handleKeyDown, true);
  documentObject.addEventListener('pointerdown', handlePointerDown, true);

  return () => {
    windowObject.removeEventListener('popstate', handlePopState);
    windowObject.removeEventListener('keydown', handleKeyDown, true);
    documentObject.removeEventListener('pointerdown', handlePointerDown, true);
  };
}
