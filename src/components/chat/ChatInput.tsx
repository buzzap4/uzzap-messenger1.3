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
  Image
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import EmojiModal from './EmojiModal';

interface ChatInputProps {
  onSend: (message: string, emoticon?: { id: string, source: any }) => void;
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
  const [isEmojiModalVisible, setIsEmojiModalVisible] = useState(false);
  const [selectedEmoticon, setSelectedEmoticon] = useState<{ id: string, source: any } | null>(null);
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
    if ((message.trim() === '' && !selectedEmoticon) || disabled || loading) return;
    
    // Send message with emoticon if selected
    if (selectedEmoticon) {
      onSend(message.trim(), selectedEmoticon);
      setSelectedEmoticon(null);
    } else {
      onSend(message.trim());
    }
    
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
  const isSendEnabled = (message.trim() !== '' || selectedEmoticon !== null) && !disabled && !loading;
  
  // Handle emoticon selection
  const handleEmoticonSelect = (emoticonId: string, emoticonSource: any) => {
    setSelectedEmoticon({ id: emoticonId, source: emoticonSource });
    Keyboard.dismiss();
  };

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
              Keyboard.dismiss();
              setIsEmojiModalVisible(true);
            }}
          >
            <Ionicons name="happy-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            {selectedEmoticon && (
              <View style={styles.selectedEmoticonContainer}>
                <Image 
                  source={selectedEmoticon.source} 
                  style={styles.selectedEmoticon} 
                  resizeMode="contain"
                />
                <TouchableOpacity 
                  style={styles.removeEmoticonButton}
                  onPress={() => setSelectedEmoticon(null)}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
            <TextInput
              ref={inputRef}
              style={[styles.input, selectedEmoticon ? styles.inputWithEmoticon : null]}
              placeholder={selectedEmoticon ? '' : placeholder}
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
          </View>

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

      {/* Emoji Modal */}
      <EmojiModal 
        visible={isEmojiModalVisible}
        onClose={() => setIsEmojiModalVisible(false)}
        onEmojiSelect={handleEmoticonSelect}
      />
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
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: FONTS.body2.fontFamily,
    fontSize: FONTS.body2.fontSize,
    fontWeight: FONTS.body2.fontWeight as any, // Type assertion to fix TypeScript error
    letterSpacing: FONTS.body2.letterSpacing,
    color: COLORS.text,
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  inputWithEmoticon: {
    paddingLeft: 4,
  },
  selectedEmoticonContainer: {
    position: 'relative',
    marginLeft: 4,
  },
  selectedEmoticon: {
    width: 28,
    height: 28,
  },
  removeEmoticonButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.card,
    borderRadius: 10,
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
