import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  Text,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '@/theme';
import LinearGradient from 'react-native-linear-gradient';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  name?: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 40,
  name,
  onPress,
  containerStyle,
  imageStyle,
  showStatus = false,
  status = 'offline',
  showBorder = false,
  borderColor = COLORS.primary,
  borderWidth = 2,
}) => {
  // Generate initials from name
  const getInitials = () => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else {
      return (
        nameParts[0].charAt(0).toUpperCase() +
        nameParts[nameParts.length - 1].charAt(0).toUpperCase()
      );
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return COLORS.success;
      case 'away':
        return COLORS.warning;
      case 'busy':
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  // Generate a consistent color based on name
  const getColorFromName = () => {
    if (!name) return [COLORS.primaryLight, COLORS.primary];
    
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colorIndex = charCodeSum % avatarGradients.length;
    return avatarGradients[colorIndex];
  };

  const avatarGradients = [
    [COLORS.primary, COLORS.primaryDark],
    [COLORS.secondary, COLORS.secondaryDark],
    [COLORS.accent, COLORS.accentDark],
    ['#FF9F43', '#F76B1C'],
    ['#20BDFF', '#5433FF'],
    ['#A26BFA', '#6A11CB'],
    ['#FC5C7D', '#6A82FB'],
    ['#00B09B', '#96C93D'],
  ];

  const renderContent = () => {
    const containerDimensions = {
      width: size,
      height: size,
      borderRadius: size / 2,
    };

    if (uri) {
      return (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            containerDimensions,
            imageStyle,
          ]}
          defaultSource={require('@/assets/default-avatar.png')}
        />
      );
    } else {
      return (
        <LinearGradient
          colors={getColorFromName()}
          style={[styles.initialsContainer, containerDimensions]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
            {getInitials()}
          </Text>
        </LinearGradient>
      );
    }
  };

  const content = (
    <View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size,
          borderRadius: size / 2,
          borderWidth: showBorder ? borderWidth : 0,
          borderColor: borderColor,
        }, 
        containerStyle
      ]}
    >
      {renderContent()}
      
      {showStatus && (
        <View 
          style={[
            styles.statusIndicator,
            { 
              backgroundColor: getStatusColor(),
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              borderWidth: size * 0.03,
            }
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  initials: {
    ...FONTS.h3,
    color: COLORS.card,
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: COLORS.card,
  },
});

export default Avatar;
