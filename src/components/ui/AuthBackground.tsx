import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

interface AuthBackgroundProps {
  children: React.ReactNode;
}

const AuthBackground: React.FC<AuthBackgroundProps> = ({ children }) => {
  // Animation values for the floating blobs
  const blob1Position = useSharedValue({ x: width * 0.1, y: height * 0.1 });
  const blob2Position = useSharedValue({ x: width * 0.7, y: height * 0.2 });
  const blob3Position = useSharedValue({ x: width * 0.2, y: height * 0.7 });
  
  const blob1Scale = useSharedValue(1);
  const blob2Scale = useSharedValue(0.8);
  const blob3Scale = useSharedValue(1.2);

  // Start animations
  React.useEffect(() => {
    // Blob 1 animation
    blob1Position.value = withRepeat(
      withTiming(
        { x: width * 0.15, y: height * 0.15 },
        { duration: 10000, easing: Easing.inOut(Easing.ease) }
      ),
      -1,
      true
    );
    blob1Scale.value = withRepeat(
      withTiming(1.1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Blob 2 animation
    blob2Position.value = withDelay(
      500,
      withRepeat(
        withTiming(
          { x: width * 0.75, y: height * 0.25 },
          { duration: 12000, easing: Easing.inOut(Easing.ease) }
        ),
        -1,
        true
      )
    );
    blob2Scale.value = withDelay(
      500,
      withRepeat(
        withTiming(0.9, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );

    // Blob 3 animation
    blob3Position.value = withDelay(
      1000,
      withRepeat(
        withTiming(
          { x: width * 0.25, y: height * 0.75 },
          { duration: 15000, easing: Easing.inOut(Easing.ease) }
        ),
        -1,
        true
      )
    );
    blob3Scale.value = withDelay(
      1000,
      withRepeat(
        withTiming(1.3, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  // Animated styles for blobs
  const blob1Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: blob1Position.value.x },
        { translateY: blob1Position.value.y },
        { scale: blob1Scale.value },
      ],
    };
  });

  const blob2Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: blob2Position.value.x },
        { translateY: blob2Position.value.y },
        { scale: blob2Scale.value },
      ],
    };
  });

  const blob3Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: blob3Position.value.x },
        { translateY: blob3Position.value.y },
        { scale: blob3Scale.value },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[COLORS.background, COLORS.background]}
        style={styles.gradient}
      />

      {/* Animated blobs */}
      <Animated.View style={[styles.blob, styles.blob1, blob1Style]}>
        <LinearGradient
          colors={[COLORS.primaryLight, COLORS.primary]}
          style={styles.blobGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.blob, styles.blob2, blob2Style]}>
        <LinearGradient
          colors={[COLORS.secondaryLight, COLORS.secondary]}
          style={styles.blobGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.blob, styles.blob3, blob3Style]}>
        <LinearGradient
          colors={[COLORS.accentLight, COLORS.accent]}
          style={styles.blobGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Content overlay */}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
  },
  blobGradient: {
    width: '100%',
    height: '100%',
  },
  blob1: {
    width: width * 0.6,
    height: width * 0.6,
    opacity: 0.7,
  },
  blob2: {
    width: width * 0.5,
    height: width * 0.5,
    opacity: 0.5,
  },
  blob3: {
    width: width * 0.7,
    height: width * 0.7,
    opacity: 0.6,
  },
  contentContainer: {
    flex: 1,
    zIndex: 10,
    position: 'relative',
  },
});

export default AuthBackground;
