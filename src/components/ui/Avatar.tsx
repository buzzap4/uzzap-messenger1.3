import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  Text,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS } from '../../theme';
import LinearGradient from 'react-native-linear-gradient';
import { DEFAULT_AVATAR_URL, FALLBACK_AVATAR_URL } from '@/lib/constants';

/**
 * Avatar component props
 */
interface AvatarProps {
  /** Image URI for the avatar */
  uri?: string | null;
  /** Size of the avatar (width and height) */
  size?: number;
  /** User's name (used for initials and fallback) */
  name?: string;
  /** Username (used for fallback avatar generation) */
  username?: string;
  /** Function to call when avatar is pressed */
  onPress?: () => void;
  /** Additional styles for the container */
  containerStyle?: ViewStyle;
  /** Additional styles for the image */
  imageStyle?: ImageStyle;
  /** Legacy style prop for backward compatibility */
  style?: ImageStyle;
  /** Whether to show online status indicator */
  showStatus?: boolean;
  /** User's online status */
  status?: 'online' | 'offline' | 'away' | 'busy';
  /** Whether to show border around avatar */
  showBorder?: boolean;
  /** Color of the border */
  borderColor?: string;
  /** Width of the border */
  borderWidth?: number;
}

/**
 * Avatar component that displays user avatar with fallback options
 * - Shows image if URI is provided
 * - Falls back to initials on gradient background if name is provided
 * - Falls back to generated avatar if username is provided
 */
const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 40,
  name,
  username,
  onPress,
  containerStyle,
  imageStyle,
  style, // Add support for legacy style prop
  showStatus = false,
  status = 'offline',
  showBorder = false,
  borderColor = COLORS.primary,
  borderWidth = 2,
}) => {
  // Track if the image failed to load
  const [hasError, setHasError] = useState(false);
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

  /**
   * Get avatar URL with fallback options
   */
  const getAvatarUrl = () => {
    if (!hasError && uri) return uri;
    
    // If we have a username, use DiceBear Avataaars with username seed
    if (username) {
      const primaryFallback = `${DEFAULT_AVATAR_URL}?seed=${username}&backgroundColor=random`;
      const secondaryFallback = `${FALLBACK_AVATAR_URL}?seed=${username}`;
      return hasError ? secondaryFallback : primaryFallback;
    }
    
    // No fallback URL needed if we're showing initials
    return '';
  };

  /**
   * Render the avatar content based on available data
   */
  const renderContent = () => {
    const containerDimensions = {
      width: size,
      height: size,
      borderRadius: size / 2,
    };

    // If we have a URI and no error, or we have a username for fallback
    if ((uri && !hasError) || username) {
      return (
        <Image
          source={{ uri: getAvatarUrl() }}
          style={[
            styles.image,
            containerDimensions,
            imageStyle,
            style, // Include legacy style prop
          ]}
          onError={() => setHasError(true)}
          defaultSource={require('@/assets/default-avatar.png')}
        />
      );
    } else {
      // Fallback to initials on gradient background
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
