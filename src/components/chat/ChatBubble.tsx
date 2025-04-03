import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme';
import Avatar from '../ui/Avatar';
import { Message, User } from '@/src/types/models';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { format } from 'date-fns';
import EmoticonRenderer from './EmoticonRenderer';

interface ChatBubbleProps {
  message: Message;
  currentUser: User;
  showAvatar?: boolean;
  onLongPress?: (message: Message) => void;
  previousMessage?: Message | null;
  nextMessage?: Message | null;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  currentUser,
  showAvatar = true,
  onLongPress,
  previousMessage,
  nextMessage,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const isCurrentUser = message.user_id === currentUser.id;
  const isSameUser = previousMessage?.user_id === message.user_id;
  const isNextSameUser = nextMessage?.user_id === message.user_id;

  // Format timestamp
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'h:mm a');
    } catch (error) {
      return '';
    }
  };

  // Handle long press animation
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 100 });
    opacity.value = withTiming(0.9, { duration: 150 });
    setIsPressed(true);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 150 });
    setIsPressed(false);
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Determine bubble style based on user and message position in sequence
  const getBubbleStyle = () => {
    const baseStyle = isCurrentUser
      ? styles.currentUserBubble
      : styles.otherUserBubble;

    // Apply custom bubble color if available
    if (message.bubble_color) {
      return [
        baseStyle,
        { backgroundColor: message.bubble_color },
        isCurrentUser ? styles.currentUserBubbleShape : styles.otherUserBubbleShape,
      ];
    }

    // Apply different radius based on message position in sequence
    if (isSameUser && !isNextSameUser) {
      // Last message in a sequence
      return [
        baseStyle,
        isCurrentUser
          ? styles.currentUserLastBubble
          : styles.otherUserLastBubble,
      ];
    } else if (!isSameUser && isNextSameUser) {
      // First message in a sequence
      return [
        baseStyle,
        isCurrentUser
          ? styles.currentUserFirstBubble
          : styles.otherUserFirstBubble,
      ];
    } else if (isSameUser && isNextSameUser) {
      // Middle message in a sequence
      return [
        baseStyle,
        isCurrentUser
          ? styles.currentUserMiddleBubble
          : styles.otherUserMiddleBubble,
      ];
    }

    // Single message (not in a sequence)
    return [
      baseStyle,
      isCurrentUser
        ? styles.currentUserBubbleShape
        : styles.otherUserBubbleShape,
    ];
  };

  // Determine container style based on user
  const getContainerStyle = () => {
    return isCurrentUser
      ? styles.currentUserContainer
      : styles.otherUserContainer;
  };

  // Determine text color based on user
  const getTextStyle = () => {
    return isCurrentUser ? styles.currentUserText : styles.otherUserText;
  };

  // Determine if we should show the avatar
  const shouldShowAvatar = () => {
    return !isCurrentUser && showAvatar && !isNextSameUser;
  };

  // Determine if we should show the timestamp
  const shouldShowTimestamp = () => {
    return !isNextSameUser;
  };

  return (
    <View style={[styles.container, getContainerStyle()]}>
      {shouldShowAvatar() ? (
        <View style={styles.avatarContainer}>
          <Avatar
            uri={message.user?.avatar_url}
            name={message.user?.username || 'User'}
            size={30}
          />
        </View>
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}

      <View style={styles.bubbleWrapper}>
        {!isCurrentUser && !isSameUser && message.user && (
          <Text style={styles.username}>
            {message.user.display_name || message.user.username}
          </Text>
        )}

        <Pressable
          onLongPress={() => onLongPress && onLongPress(message)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          delayLongPress={200}
        >
          <Animated.View style={[getBubbleStyle(), animatedStyle, isPressed && styles.pressedBubble]}>
            {message.is_deleted ? (
              <Text style={[styles.deletedText]}>
                This message has been deleted
              </Text>
            ) : (
              <View style={styles.messageContent}>
                {message.emoticon_id && message.emoticon_source ? (
                  <View style={styles.emoticonContainer}>
                    <Image
                      source={message.emoticon_source}
                      style={styles.emoticon as any}
                      resizeMode="contain"
                    />
                    {message.content.trim() !== '' && (
                      <Text style={[styles.messageText, getTextStyle(), styles.messageWithEmoticon]}>
                        {message.content}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={[styles.messageText, getTextStyle()]}>
                    {message.content}
                  </Text>
                )}
              </View>
            )}

            {shouldShowTimestamp() && (
              <Text style={[styles.timestamp, isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp]}>
                {formatTime(message.created_at)}
                {message.is_edited && ' · Edited'}
              </Text>
            )}
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: SIZES.padding,
  },
  currentUserContainer: {
    justifyContent: 'flex-end',
    marginLeft: 50,
  },
  otherUserContainer: {
    justifyContent: 'flex-start',
    marginRight: 50,
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  avatarPlaceholder: {
    width: 30,
    marginRight: 8,
  },
  bubbleWrapper: {
    flex: 1,
  },
  username: {
    fontFamily: FONTS.body3.fontFamily,
    fontSize: FONTS.body3.fontSize,
    fontWeight: 'normal',
    letterSpacing: FONTS.body3.letterSpacing,
    color: COLORS.textSecondary,
    marginBottom: 2,
    marginLeft: 4,
  },
  currentUserBubble: {
    backgroundColor: COLORS.userBubble,
    alignSelf: 'flex-end',
    ...SHADOWS.light,
  },
  otherUserBubble: {
    backgroundColor: COLORS.otherBubble,
    alignSelf: 'flex-start',
    ...SHADOWS.light,
  },
  currentUserBubbleShape: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  otherUserBubbleShape: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  currentUserFirstBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  otherUserFirstBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
  },
  currentUserMiddleBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  otherUserMiddleBubble: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
  },
  currentUserLastBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  otherUserLastBubble: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  messageText: {
    fontFamily: FONTS.body2.fontFamily,
    fontSize: 15,
    fontWeight: 'normal',
    letterSpacing: FONTS.body2.letterSpacing,
  },
  currentUserText: {
    color: COLORS.card,
  },
  otherUserText: {
    color: COLORS.text,
  },
  deletedText: {
    fontFamily: FONTS.body3.fontFamily,
    fontSize: FONTS.body3.fontSize,
    fontWeight: 'normal',
    letterSpacing: FONTS.body3.letterSpacing,
    fontStyle: 'italic',
    color: COLORS.textLight,
  },
  timestamp: {
    fontFamily: FONTS.small.fontFamily,
    fontSize: FONTS.small.fontSize,
    fontWeight: 'normal',
    letterSpacing: FONTS.small.letterSpacing,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  currentUserTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTimestamp: {
    color: COLORS.textLight,
  },
  pressedBubble: {
    opacity: 0.8,
  },
  messageContent: {
    flexDirection: 'column',
  },
  emoticonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  emoticon: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  messageWithEmoticon: {
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ChatBubble;
