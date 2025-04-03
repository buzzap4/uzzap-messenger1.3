import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../../theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  onPress?: () => void;
  animated?: boolean;
  shadowLevel?: 'none' | 'light' | 'medium' | 'dark';
  borderRadius?: number;
  backgroundColor?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  contentStyle,
  onPress,
  animated = false,
  shadowLevel = 'medium',
  borderRadius = SIZES.radius,
  backgroundColor = COLORS.card,
  ...rest
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Get shadow style based on level
  const getShadowStyle = () => {
    switch (shadowLevel) {
      case 'none':
        return {};
      case 'light':
        return SHADOWS.light;
      case 'medium':
        return SHADOWS.medium;
      case 'dark':
        return SHADOWS.dark;
      default:
        return SHADOWS.medium;
    }
  };

  // Handle press animations
  const handlePressIn = () => {
    if (animated && onPress) {
      scale.value = withSpring(0.98, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(0.9, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Base container style
  const containerStyle = [
    styles.container,
    {
      borderRadius,
      backgroundColor,
    },
    getShadowStyle(),
    style,
  ];

  // Render card with or without touch functionality
  if (onPress) {
    return (
      <Animated.View style={[animated ? animatedStyle : {}, { borderRadius }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={containerStyle}
          {...rest}
        >
          <View style={[styles.content, contentStyle]}>{children}</View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  content: {
    padding: SIZES.padding,
  },
});

export default Card;
