import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  Easing,
  interpolateColor
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'accent';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  gradient?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  gradient = false,
  fullWidth = false,
  rounded = false,
  ...rest
}) => {
  // Animation for press effect
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const pressed = useSharedValue(0);
  
  const onPressIn = () => {
    scale.value = withSpring(0.97, { 
      damping: 15, 
      stiffness: 300,
      mass: 0.8 
    });
    pressed.value = withTiming(1, { duration: 150 });
  };
  
  const onPressOut = () => {
    scale.value = withSpring(1, { 
      damping: 15, 
      stiffness: 300,
      mass: 0.8 
    });
    pressed.value = withTiming(0, { duration: 150 });
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const pressedStyle = useAnimatedStyle(() => {
    let backgroundColor;
    
    if (variant === 'primary') {
      backgroundColor = interpolateColor(
        pressed.value,
        [0, 1],
        [COLORS.primary, COLORS.primaryDark]
      );
    } else if (variant === 'secondary') {
      backgroundColor = interpolateColor(
        pressed.value,
        [0, 1],
        [COLORS.secondary, COLORS.secondaryDark]
      );
    } else if (variant === 'accent') {
      backgroundColor = interpolateColor(
        pressed.value,
        [0, 1],
        [COLORS.accent, COLORS.accentDark]
      );
    } else if (variant === 'outline') {
      backgroundColor = interpolateColor(
        pressed.value,
        [0, 1],
        [COLORS.transparent, COLORS.border]
      );
    } else {
      backgroundColor = COLORS.transparent;
    }
    
    return {
      backgroundColor,
    };
  });

  // Determine button styles based on variant and size
  const getButtonStyles = () => {
    let buttonStyles = {};
    
    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyles = styles.primaryButton;
        break;
      case 'secondary':
        buttonStyles = styles.secondaryButton;
        break;
      case 'accent':
        buttonStyles = styles.accentButton;
        break;
      case 'outline':
        buttonStyles = styles.outlineButton;
        break;
      case 'text':
        buttonStyles = styles.textButton;
        break;
      default:
        buttonStyles = styles.primaryButton;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        buttonStyles = { ...buttonStyles, ...styles.smallButton };
        break;
      case 'medium':
        buttonStyles = { ...buttonStyles, ...styles.mediumButton };
        break;
      case 'large':
        buttonStyles = { ...buttonStyles, ...styles.largeButton };
        break;
      default:
        buttonStyles = { ...buttonStyles, ...styles.mediumButton };
    }
    
    // Disabled styles
    if (disabled || loading) {
      buttonStyles = { ...buttonStyles, ...styles.disabledButton };
    }
    
    // Full width
    if (fullWidth) {
      buttonStyles = { ...buttonStyles, ...styles.fullWidthButton };
    }
    
    // Rounded
    if (rounded) {
      buttonStyles = { ...buttonStyles, ...styles.roundedButton };
    }
    
    return buttonStyles;
  };
  
  // Determine text styles based on variant
  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'accent':
        return styles.accentText;
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textButtonText;
      default:
        return styles.primaryText;
    }
  };

  // Render button content
  const renderContent = () => {
    return (
      <>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' || variant === 'text' ? COLORS.primary : COLORS.card} 
          />
        ) : (
          <View style={styles.contentContainer}>
            {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
            <Text style={[getTextStyles(), textStyle]}>{title}</Text>
            {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
          </View>
        )}
      </>
    );
  };

  // Render button with or without gradient
  if (gradient && (variant === 'primary' || variant === 'accent') && !disabled && !loading) {
    const gradientColors = variant === 'primary' 
      ? [COLORS.gradientStart, COLORS.gradientEnd]
      : [COLORS.accent, COLORS.gradientAccent];
      
    return (
      <Animated.View style={[animatedStyle, fullWidth && styles.fullWidthContainer, style]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={disabled || loading}
          style={[styles.container]}
          {...rest}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[getButtonStyles(), styles.gradientButton]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, fullWidth && styles.fullWidthContainer, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        style={[styles.container, getButtonStyles()]}
        {...rest}
      >
        <Animated.View style={[styles.pressedOverlay, pressedStyle]}>
          {renderContent()}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radiusMedium,
    overflow: 'hidden',
  },
  fullWidthContainer: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: SIZES.spacingS,
  },
  iconRight: {
    marginLeft: SIZES.spacingS,
  },
  pressedOverlay: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderWidth: 0,
    ...SHADOWS.medium,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 0,
    ...SHADOWS.medium,
  },
  accentButton: {
    backgroundColor: COLORS.accent,
    borderWidth: 0,
    ...SHADOWS.medium,
  },
  outlineButton: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  textButton: {
    backgroundColor: COLORS.transparent,
    borderWidth: 0,
    paddingHorizontal: SIZES.spacingM,
  },
  smallButton: {
    paddingVertical: SIZES.spacingXS,
    paddingHorizontal: SIZES.spacingM,
    minHeight: 32,
  },
  mediumButton: {
    paddingVertical: SIZES.spacingS,
    paddingHorizontal: SIZES.spacingL,
    minHeight: 44,
  },
  largeButton: {
    paddingVertical: SIZES.spacingM,
    paddingHorizontal: SIZES.spacingXL,
    minHeight: 56,
  },
  disabledButton: {
    backgroundColor: COLORS.textLight,
    borderColor: COLORS.textLight,
    ...SHADOWS.none,
    opacity: 0.6,
  },
  fullWidthButton: {
    width: '100%',
  },
  roundedButton: {
    borderRadius: SIZES.radiusRound,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryText: {
    fontFamily: 'System',
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.card,
  },
  secondaryText: {
    fontFamily: 'System',
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.card,
  },
  accentText: {
    fontFamily: 'System',
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.card,
  },
  outlineText: {
    fontFamily: 'System',
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.primary,
  },
  textButtonText: {
    fontFamily: 'System',
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default Button;
