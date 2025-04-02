import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/theme';
import Avatar from '../ui/Avatar';
import { format, isToday, isYesterday } from 'date-fns';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

interface ChatroomItemProps {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  avatarUri?: string | null;
  unreadCount?: number;
  onPress: (id: string) => void;
  isActive?: boolean;
  onlineCount?: number;
}

const ChatroomItem: React.FC<ChatroomItemProps> = ({
  id,
  name,
  lastMessage,
  lastMessageTime,
  avatarUri,
  unreadCount = 0,
  onPress,
  isActive = false,
  onlineCount = 0,
}) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const highlighted = useSharedValue(isActive ? 1 : 0);

  // Update highlighted value when isActive changes
  React.useEffect(() => {
    highlighted.value = withTiming(isActive ? 1 : 0, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isActive]);

  // Format timestamp
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      if (isToday(date)) {
        return format(date, 'h:mm a');
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM d');
      }
    } catch (error) {
      return '';
    }
  };

  // Handle press animation
  const handlePressIn = () => {
    scale.value = withSpring(0.98, { 
      damping: 15, 
      stiffness: 300,
      mass: 0.8 
    });
    pressed.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { 
      damping: 15, 
      stiffness: 300,
      mass: 0.8 
    });
    pressed.value = withTiming(0, { duration: 150 });
  };

  const handlePress = () => {
    onPress(id);
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const highlightedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      highlighted.value,
      [0, 1],
      [COLORS.card, COLORS.background]
    );

    const borderLeftColor = interpolateColor(
      highlighted.value,
      [0, 1],
      [COLORS.transparent, COLORS.primary]
    );

    return {
      backgroundColor,
      borderLeftColor,
      borderLeftWidth: highlighted.value * 4,
    };
  });

  const pressedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      pressed.value,
      [0, 1],
      [isActive ? COLORS.background : COLORS.card, COLORS.border]
    );

    return {
      backgroundColor,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        style={({ pressed }) => [styles.pressable]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        android_ripple={{ color: COLORS.border, borderless: false }}
      >
        <Animated.View style={[styles.content, highlightedStyle, pressedStyle]}>
          <Avatar
            uri={avatarUri}
            name={name}
            size={50}
            showStatus={true}
            status={isActive ? 'online' : 'offline'}
          />

          <View style={styles.textContainer}>
            <View style={styles.topRow}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              {lastMessageTime && (
                <Text style={styles.time}>{formatTime(lastMessageTime)}</Text>
              )}
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.messageContainer}>
                {lastMessage ? (
                  <Text style={styles.message} numberOfLines={1}>
                    {lastMessage}
                  </Text>
                ) : (
                  <Text style={styles.noMessage}>No messages yet</Text>
                )}
                
                {onlineCount > 0 && (
                  <View style={styles.onlineIndicator}>
                    <Text style={styles.onlineCount}>{onlineCount} online</Text>
                  </View>
                )}
              </View>

              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.spacingS,
  },
  pressable: {
    borderRadius: SIZES.radiusMedium,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacingM,
    borderRadius: SIZES.radiusMedium,
    backgroundColor: COLORS.card,
    ...SHADOWS.light,
  },
  textContainer: {
    flex: 1,
    marginLeft: SIZES.spacingM,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingXS,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.spacingS,
  },
  name: {
    fontFamily: 'System',
    fontSize: SIZES.body1,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: SIZES.spacingS,
  },
  time: {
    fontFamily: 'System',
    fontSize: SIZES.small,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  message: {
    fontFamily: 'System',
    fontSize: SIZES.body3,
    fontWeight: '400',
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: SIZES.spacingS,
  },
  noMessage: {
    fontFamily: 'System',
    fontSize: SIZES.body3,
    fontWeight: '400',
    color: COLORS.textLight,
    fontStyle: 'italic',
    flex: 1,
    marginRight: SIZES.spacingS,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20', // 20% opacity
    paddingHorizontal: SIZES.spacingS,
    paddingVertical: 2,
    borderRadius: SIZES.radiusRound,
    marginLeft: SIZES.spacingS,
  },
  onlineCount: {
    fontFamily: 'System',
    fontSize: SIZES.small,
    fontWeight: '400',
    color: COLORS.success,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusRound,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontFamily: 'System',
    fontSize: SIZES.small,
    fontWeight: '700',
    color: COLORS.card,
  },
});

export default ChatroomItem;
