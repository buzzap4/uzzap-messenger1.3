import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../ui/Avatar';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  avatarUri?: string | null;
  onAvatarPress?: () => void;
  onInfoPress?: () => void;
  online?: boolean;
  membersCount?: number;
  showBackButton?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  subtitle,
  avatarUri,
  onAvatarPress,
  onInfoPress,
  online = false,
  membersCount,
  showBackButton = true,
}) => {
  const router = useRouter();
  const backButtonScale = useSharedValue(1);
  const infoButtonScale = useSharedValue(1);

  // Animation for back button
  const handleBackButtonPress = () => {
    backButtonScale.value = withSpring(0.9, { damping: 10, stiffness: 100 });
    setTimeout(() => {
      backButtonScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      router.back();
    }, 100);
  };

  // Animation for info button
  const handleInfoButtonPress = () => {
    if (onInfoPress) {
      infoButtonScale.value = withSpring(0.9, { damping: 10, stiffness: 100 });
      setTimeout(() => {
        infoButtonScale.value = withSpring(1, { damping: 10, stiffness: 100 });
        onInfoPress();
      }, 100);
    }
  };

  // Animated styles
  const backButtonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: backButtonScale.value }],
    };
  });

  const infoButtonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: infoButtonScale.value }],
    };
  });

  return (
    <View style={styles.container}>
      {showBackButton && (
        <Animated.View style={backButtonAnimStyle}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackButtonPress}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      <TouchableOpacity
        style={styles.profileContainer}
        onPress={onAvatarPress}
        activeOpacity={onAvatarPress ? 0.7 : 1}
      >
        <Avatar
          uri={avatarUri}
          name={title}
          size={40}
          showStatus={true}
          status={online ? 'online' : 'offline'}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle || (membersCount ? `${membersCount} members` : online ? 'Online' : 'Offline')}
          </Text>
        </View>
      </TouchableOpacity>

      <Animated.View style={infoButtonAnimStyle}>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={handleInfoButtonPress}
          disabled={!onInfoPress}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        paddingTop: 50, // Adjust for iOS status bar
        height: 94,
      },
      android: {
        paddingTop: 10,
        height: 64,
      },
    }),
    ...SHADOWS.light,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 4,
  },
  profileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  infoButton: {
    padding: 8,
    borderRadius: 20,
  },
});

export default ChatHeader;
