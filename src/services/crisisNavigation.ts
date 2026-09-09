export const CRISIS_RESOURCES_PATH = '/crisis-resources';
export const REQUIRED_CRISIS_RESOURCES_HREF = '/crisis-resources?required=1';
export const CRISIS_RESOURCES_ROOT_ID = 'crisis-resources-screen';

export function isCrisisResourcesPath(pathname: string) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return normalized === CRISIS_RESOURCES_PATH;
}

export function shouldBlockForSafety(input: {
  pending: boolean;
  signedIn: boolean;
  pathname: string;
}) {
  return input.pending && input.signedIn && !isCrisisResourcesPath(input.pathname);
}
