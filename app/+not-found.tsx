import { Redirect } from 'expo-router';

// Root safety enforcement runs before this fallback. When no safety
// acknowledgment is pending, unknown internal URLs return to normal routing.
export default function NotFoundScreen() {
  return <Redirect href="/" />;
}
