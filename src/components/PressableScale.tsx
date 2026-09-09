import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Pressable } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
};

export function PressableScale({ children, disabled, onPressIn, onPressOut, style, ...props }: PressableScaleProps) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.get() * 0.1,
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      pressRetentionOffset={12}
      style={[style, disabled && { opacity: 0.52 }, animatedStyle]}
      onPressIn={(event) => {
        pressed.set(withTiming(1, { duration: 110, reduceMotion: ReduceMotion.System }));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.set(withTiming(0, { duration: 130, reduceMotion: ReduceMotion.System }));
        onPressOut?.(event);
      }}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
