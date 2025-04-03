import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/context/theme';
import { COLORS, SHADOWS } from '../../theme';

interface FABProps {
  onPress: () => void;
  style?: ViewStyle;
  icon?: React.ReactNode;
  color?: string;
}

export default function FloatingActionButton({ 
  onPress, 
  style, 
  icon, 
  color = COLORS.primary 
}: FABProps) {
  const { colors } = useTheme();
  const scale = new Animated.Value(1);

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: color }, style]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.8}
      >
        {icon || <Plus size={24} color={COLORS.background} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
});
