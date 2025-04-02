import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Easing,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  onSend: (message: string) => void;
  onTyping?: () => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onTyping,
  placeholder = 'Type a message...',
  disabled = false,
  loading = false,
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<TextInput>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Animation for send button
  const animateSendButton = (pressed: boolean) => {
    Animated.spring(sendButtonScale, {
      toValue: pressed ? 0.9 : 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Handle sending message
  const handleSend = () => {
    if (message.trim() === '' || disabled || loading) return;
    
    onSend(message.trim());
    setMessage('');
    
    // Animate send button
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.8,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(sendButtonScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle typing notification
  const handleTyping = () => {
    if (onTyping) {
      onTyping();
    }

    // Clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Set new timeout
    typingTimeout.current = setTimeout(() => {
      // Typing stopped
    }, 1000);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  // Determine if send button should be enabled
  const isSendEnabled = message.trim() !== '' && !disabled && !loading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              // Add emoji picker functionality here
            }}
          >
            <Ionicons name="happy-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textLight}
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              handleTyping();
            }}
            multiline
            maxLength={500}
            returnKeyType="default"
            blurOnSubmit={false}
            editable={!disabled}
          />

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              // Add attachment functionality here
            }}
          >
            <Ionicons name="attach-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.sendButtonContainer,
            { transform: [{ scale: sendButtonScale }] },
            !isSendEnabled && styles.disabledSendButton,
          ]}
        >
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!isSendEnabled}
            onPressIn={() => animateSendButton(true)}
            onPressOut={() => animateSendButton(false)}
          >
            {loading ? (
              <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.card} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.card} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingHorizontal: 8,
    marginRight: 8,
    ...SHADOWS.light,
  },
  input: {
    flex: 1,
    ...FONTS.body2,
    color: COLORS.text,
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  sendButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  sendButton: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.7,
  },
});

export default ChatInput;
