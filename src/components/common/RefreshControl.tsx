import React from 'react';
import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native';
import { COLORS } from '@/theme';

interface Props extends Omit<RefreshControlProps, 'refreshing' | 'onRefresh'> {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  color?: string;
}

export const RefreshControl: React.FC<Props> = ({ 
  refreshing, 
  onRefresh, 
  color = COLORS.primary,
  ...props 
}) => {
  return (
    <RNRefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[color]} // Android
      tintColor={color} // iOS
      {...props}
    />
  );
};

export default RefreshControl;
