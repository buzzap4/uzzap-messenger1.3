import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Text,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/auth';
import { useMessages } from '../../src/hooks/useMessages';
import { supabase } from '../../lib/supabase';
import { Message as MessageType, User } from '../../src/types/models';
import { COLORS, SIZES } from '../../src/theme';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

// Import our new UI components
import ChatHeader from '../../src/components/chat/ChatHeader';
import ChatInput from '../../src/components/chat/ChatInput';
import ChatBubble from '../../src/components/chat/ChatBubble';
import Button from '../../src/components/ui/Button';
import Card from '../../src/components/ui/Card';

// Import services
import { sendMessage } from '../../src/services/messageService';
import { joinChatroom, verifyOrJoinChatroom } from '../../src/services/chatroomService';

// Define the getChatroom function since it's missing
const getChatroom = async (chatroomId: string) => {
  try {
    const { data, error } = await supabase
      .from('chatrooms')
      .select(`
        id,
        name,
        description,
        avatar_url,
        created_at,
        updated_at,
        region_id,
        created_by,
        members_count:chatroom_memberships(count)
      `)
      .eq('id', chatroomId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching chatroom:', error);
    throw error;
  }
};

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [chatroomName, setChatroomName] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [chatroomInfo, setChatroomInfo] = useState<any>(null);
  
  const { messages, loading, error, refresh, addMessage } = useMessages(id);
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const inputOpacity = useSharedValue(0);
  const errorShake = useSharedValue(0);

  // Fetch chatroom info
  const fetchChatroomInfo = useCallback(async () => {
    if (!id || !session) return;
    
    try {
      const data = await getChatroom(id);
      if (data) {
        setChatroomInfo(data);
        setChatroomName(data.name);
      }
    } catch (error) {
      console.error('Error fetching chatroom info:', error);
    }
  }, [id, session]);

  // Join chatroom
  const handleJoinChatroom = useCallback(async () => {
    if (!id || !session) return;
    
    setIsJoining(true);
    setJoinError(null);
    
    try {
      const { error } = await joinChatroom(id);
      
      if (error) {
        setJoinError(error.message || 'Failed to join chatroom');
        // Animate error shake
        errorShake.value = withSequence(
          withTiming(-10, { duration: 100 }),
          withTiming(10, { duration: 100 }),
          withTiming(-10, { duration: 100 }),
          withTiming(0, { duration: 100 })
        );
      } else {
        // Refresh chatroom info after joining
        await fetchChatroomInfo();
      }
    } catch (error: any) {
      setJoinError(error.message || 'Failed to join chatroom');
      // Animate error shake
      errorShake.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    } finally {
      setIsJoining(false);
    }
  }, [id, session, fetchChatroomInfo, errorShake]);

  // Verify or join chatroom
  const handleVerifyOrJoinChatroom = useCallback(async () => {
    if (!id || !session) return false;
    
    try {
      const { success, error } = await verifyOrJoinChatroom(id, session.user.id);
      
      if (!success) {
        setJoinError(error?.message || 'Failed to join chatroom');
        return false;
      }
      
      return true;
    } catch (error: any) {
      setJoinError(error.message || 'Failed to join chatroom');
      return false;
    }
  }, [id, session]);

  // Send message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!id || !session || !content.trim()) return;
    
    setSendingMessage(true);
    
    try {
      // Verify or join chatroom before sending message
      const canSend = await handleVerifyOrJoinChatroom();
      
      if (!canSend) {
        Alert.alert('Error', 'You need to join this chatroom first');
        setSendingMessage(false);
        return;
      }
      
      const { data, error } = await sendMessage(content, id);
      
      if (data) {
        // Add message to local state
        addMessage(data);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      } else {
        Alert.alert('Error', error?.message || 'Failed to send message');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  }, [id, session, handleVerifyOrJoinChatroom, addMessage]);

  // Initialize screen
  useEffect(() => {
    if (!id || !session) return;
    
    // Start animations
    headerOpacity.value = withTiming(1, { duration: 500 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    inputOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    
    // Fetch chatroom info
    fetchChatroomInfo();
    
    // Check if user is already a member
    handleVerifyOrJoinChatroom();
  }, [id, session, fetchChatroomInfo, handleVerifyOrJoinChatroom]);

  // Animated styles
  const headerAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [
        { translateY: withTiming(headerOpacity.value * 0, { duration: 500 }) }
      ],
    };
  });
  
  const contentAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [
        { translateY: withTiming((1 - contentOpacity.value) * 20, { duration: 500 }) }
      ],
    };
  });
  
  const inputAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: inputOpacity.value,
      transform: [
        { translateY: withTiming((1 - inputOpacity.value) * 20, { duration: 500 }) }
      ],
    };
  });
  
  const errorAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: errorShake.value }],
    };
  });

  // Render message item
  const renderMessageItem = ({ item, index }: { item: MessageType; index: number }) => {
    const previousMessage = index < messages.length - 1 ? messages[index + 1] : null;
    const nextMessage = index > 0 ? messages[index - 1] : null;
    
    // Create a complete User object with required properties
    const currentUser: User = {
      id: session?.user.id || '',
      username: session?.user.user_metadata?.username || '',
      avatar_url: session?.user.user_metadata?.avatar_url || null,
      created_at: '',
      updated_at: ''
    };
    
    return (
      <ChatBubble
        message={item}
        currentUser={currentUser}
        previousMessage={previousMessage}
        nextMessage={nextMessage}
        onLongPress={(message) => {
          // Handle long press (e.g., show options to delete/edit)
          if (message.user_id === session?.user.id) {
            Alert.alert(
              'Message Options',
              'What would you like to do?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Edit', onPress: () => {} },
                { text: 'Delete', style: 'destructive', onPress: () => {} },
              ]
            );
          }
        }}
      />
    );
  };

  // Render loading state
  if (loading && messages.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar style="dark" />
      
      {/* Chat Header */}
      <Animated.View style={headerAnimStyle}>
        <ChatHeader
          title={chatroomName || `Chatroom ${id}`}
          subtitle={chatroomInfo?.description || ''}
          avatarUri={chatroomInfo?.avatar_url}
          membersCount={chatroomInfo?.members_count}
          onInfoPress={() => {
            // Show chatroom info
          }}
        />
      </Animated.View>
      
      {/* Messages List */}
      <Animated.View style={[styles.messagesContainer, contentAnimStyle]}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error}
            </Text>
            <Button
              title="Retry"
              onPress={refresh}
              variant="primary"
              size="small"
              style={{ marginTop: 10 }}
            />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            inverted
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No messages yet. Be the first to send a message!
                </Text>
              </View>
            }
          />
        )}
      </Animated.View>
      
      {/* Join Chatroom Error */}
      {joinError && (
        <Animated.View style={[styles.joinErrorContainer, errorAnimStyle]}>
          <Card shadowLevel="light" style={styles.joinErrorCard}>
            <Text style={styles.joinErrorText}>{joinError}</Text>
            <Button
              title="Join Chatroom"
              onPress={handleJoinChatroom}
              loading={isJoining}
              disabled={isJoining}
              variant="primary"
              size="small"
              style={{ marginTop: 10 }}
            />
          </Card>
        </Animated.View>
      )}
      
      {/* Chat Input */}
      <Animated.View style={inputAnimStyle}>
        <ChatInput
          onSend={handleSendMessage}
          placeholder="Type a message..."
          disabled={sendingMessage || !!joinError}
          loading={sendingMessage}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.error,
    marginBottom: 10,
  },
  joinErrorContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    padding: SIZES.padding,
  },
  joinErrorCard: {
    padding: SIZES.padding,
    alignItems: 'center',
  },
  joinErrorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
});