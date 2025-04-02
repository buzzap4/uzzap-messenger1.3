import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '@/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  onLeftIconPress?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onLeftIconPress,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
    onFocus && onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
    onBlur && onBlur(e);
  };

  const borderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      [error ? COLORS.error : COLORS.border, COLORS.primary]
    );

    return {
      borderColor,
    };
  });

  const labelAnimStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        focusAnim.value,
        [0, 1],
        [error ? COLORS.error : COLORS.textSecondary, COLORS.primary]
      ),
    };
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Animated.Text style={[styles.label, labelAnimStyle, labelStyle]}>
          {label}
        </Animated.Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          borderStyle,
          error && styles.errorInput,
          isFocused && styles.focusedInput,
        ]}
      >
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
            style={styles.iconContainer}
          >
            {leftIcon}
          </TouchableOpacity>
        )}
        <TextInput
          style={[
            styles.input,
            inputStyle,
            leftIcon && { paddingLeft: 0 },
            rightIcon && { paddingRight: 0 },
          ]}
          placeholderTextColor={COLORS.textLight}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.iconContainer}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding,
  },
  label: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.card,
    overflow: 'hidden',
  },
  input: {
    ...FONTS.body2,
    color: COLORS.text,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base * 1.5,
    flex: 1,
  },
  iconContainer: {
    paddingHorizontal: SIZES.padding / 2,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  focusedInput: {
    borderColor: COLORS.primary,
  },
  errorText: {
    ...FONTS.body3,
    color: COLORS.error,
    marginTop: SIZES.base / 2,
  },
});

export default Input;
