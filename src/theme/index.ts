import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Primary colors
  primary: '#5D5FEF',
  primaryLight: '#8B8EFF',
  primaryDark: '#4A4AD7',
  
  // Secondary colors
  secondary: '#00CFDE',
  secondaryLight: '#7EEEF5',
  secondaryDark: '#00A3B4',
  
  // Accent colors
  accent: '#FF5C8D',
  accentLight: '#FF8FB0',
  accentDark: '#E62E6B',
  
  // Neutral colors
  background: '#F8F9FD',
  card: '#FFFFFF',
  text: '#1A1D2F',
  textSecondary: '#4E5579',
  textLight: '#9EA3C0',
  border: '#E5E8F5',
  
  // Status colors
  success: '#0AC889',
  warning: '#FFBD12',
  error: '#FF5C5C',
  info: '#54A9FF',
  
  // Gradient colors
  gradientStart: '#5D5FEF',
  gradientEnd: '#00CFDE',
  gradientAccent: '#FF5C8D',
  
  // Chat bubble colors
  userBubble: '#5D5FEF',
  otherBubble: '#F1F3FA',
  
  // Transparent colors
  transparent: 'transparent',
  overlay: 'rgba(26, 29, 47, 0.5)',
  overlayLight: 'rgba(26, 29, 47, 0.2)',
  
  // Social media colors
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  google: '#EA4335',
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  
  // Border radius
  radiusSmall: 8,
  radiusMedium: 12,
  radiusLarge: 16,
  radiusXL: 24,
  radiusRound: 999,
  
  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body1: 16,
  body2: 14,
  body3: 12,
  small: 10,
  
  // App dimensions
  width,
  height,
  
  // Spacing
  spacingXS: 4,
  spacingS: 8,
  spacingM: 16,
  spacingL: 24,
  spacingXL: 32,
  spacing2XL: 48,
  spacing3XL: 64,
};

export const FONTS = {
  h1: { fontFamily: 'System', fontSize: SIZES.h1, fontWeight: 'bold' as const, letterSpacing: -0.5 },
  h2: { fontFamily: 'System', fontSize: SIZES.h2, fontWeight: 'bold' as const, letterSpacing: -0.3 },
  h3: { fontFamily: 'System', fontSize: SIZES.h3, fontWeight: '600' as const, letterSpacing: -0.2 },
  h4: { fontFamily: 'System', fontSize: SIZES.h4, fontWeight: '600' as const, letterSpacing: -0.1 },
  body1: { fontFamily: 'System', fontSize: SIZES.body1, fontWeight: 'normal' as const, letterSpacing: 0 },
  body2: { fontFamily: 'System', fontSize: SIZES.body2, fontWeight: 'normal' as const, letterSpacing: 0 },
  body3: { fontFamily: 'System', fontSize: SIZES.body3, fontWeight: 'normal' as const, letterSpacing: 0 },
  small: { fontFamily: 'System', fontSize: SIZES.small, fontWeight: 'normal' as const, letterSpacing: 0.2 },
  
  // Additional font styles
  bodyBold1: { fontFamily: 'System', fontSize: SIZES.body1, fontWeight: 'bold' as const, letterSpacing: 0 },
  bodyBold2: { fontFamily: 'System', fontSize: SIZES.body2, fontWeight: 'bold' as const, letterSpacing: 0 },
  bodyBold3: { fontFamily: 'System', fontSize: SIZES.body3, fontWeight: 'bold' as const, letterSpacing: 0 },
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  light: {
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dark: {
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const ANIMATIONS = {
  transition: {
    duration: 300,
  },
  spring: {
    damping: 10,
    stiffness: 100,
    mass: 1,
    overshootClamping: false,
  },
  timing: {
    duration: 400,
    easing: 'easeInOut',
  },
  stagger: {
    delay: 50,
  },
};

const theme = { COLORS, SIZES, FONTS, SHADOWS, ANIMATIONS };

export default theme;
