import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Platform,
  RefreshControl,
  StatusBar,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import { joinChatroom, leaveChatroom, isUserInChatroom } from '@/src/services/chatroomService';
import type { Region, Province } from '@/types/Region';
import { COLORS, SIZES, SHADOWS } from '@/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
  FadeInUp,
  SlideInRight,
  Easing,
  ZoomIn,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

// Import our UI components
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import ChatroomItem from '@/src/components/chat/ChatroomItem';

const { width } = Dimensions.get('window');

interface ExtendedProvince extends Province {
  chatrooms?: Array<{
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    max_members: number;
    last_message?: string;
    last_message_time?: string;
    members_count?: number;
  }>;
}

export default function RoomsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<{ [key: string]: boolean }>({});
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: number }>({});
  const [unreadMessages, setUnreadMessages] = useState<{ [key: string]: number }>({});
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const fabScale = useSharedValue(0);

  const createDefaultChatroom = async (provinceId: string, provinceName: string) => {
    try {
      // Check if chatroom already exists
      const { data: existingChatroom, error: checkError } = await supabase
        .from('chatrooms')
        .select('*')
        .eq('province_id', provinceId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing chatroom:', checkError);
        throw checkError;
      }

      if (existingChatroom) {
        return existingChatroom;
      }

      // Create new chatroom
      const { data, error } = await supabase
        .from('chatrooms')
        .insert({
          name: `${provinceName} Chat Room`,
          description: `Official chat room for ${provinceName}`,
          province_id: provinceId,
          is_active: true,
          max_members: 1000
        })
        .select()
        .single();

      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating chatroom:', error);
      return null;
    }
  };

  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select(`
          id,
          name,
          code,
          order_sequence,
          provinces:provinces (
            id,
            name,
            code,
            chatrooms:chatrooms (
              id,
              name,
              description,
              is_active,
              max_members
            )
          )
        `)
        .eq('is_active', true)
        .order('order_sequence');

      if (regionsError) throw regionsError;

      // Process regions sequentially to avoid overwhelming the server
      const processedRegions = [];
      for (const region of regionsData || []) {
        const processedProvinces = [];
        for (const province of region.provinces) {
          if (!province.chatrooms || province.chatrooms.length === 0) {
            const chatroom = await createDefaultChatroom(province.id, province.name);
            processedProvinces.push({
              ...province,
              chatrooms: chatroom ? [chatroom] : []
            });
          } else {
            processedProvinces.push({
              ...province,
              chatrooms: province.chatrooms.filter(chatroom => chatroom.is_active)
            });
          }
        }
        processedRegions.push({
          ...region,
          provinces: processedProvinces
        });
      }

      setRegions(processedRegions);
      if (processedRegions.length > 0 && !selectedRegion) {
        setSelectedRegion(processedRegions[0]);
      }
      
      // Fetch last messages for each chatroom
      await fetchLastMessages(processedRegions);
      
      // Start animations
      headerOpacity.value = withTiming(1, { duration: 500 });
      contentOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
      fabScale.value = withDelay(400, withTiming(1, { duration: 300 }));
      
    } catch (error) {
      console.error('Error fetching regions:', error);
      setError('Failed to load regions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const fetchLastMessages = async (regions: Region[]) => {
    try {
      const chatroomIds = regions.flatMap(region => 
        region.provinces.flatMap(province => 
          (province.chatrooms || []).map(chatroom => chatroom.id)
        )
      );
      
      if (chatroomIds.length === 0) return;
      
      // Fetch last message for each chatroom
      const { data: lastMessages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          chatroom_id
        `)
        .in('chatroom_id', chatroomIds)
        .order('created_at', { ascending: false })
        .limit(1, { foreignTable: 'chatroom_id' });

      if (error) {
        console.error('Error fetching last messages:', error);
        return;
      }
      
      // Update chatrooms with last message
      const updatedRegions = regions.map(region => ({
        ...region,
        provinces: region.provinces.map(province => ({
          ...province,
          chatrooms: (province.chatrooms || []).map(chatroom => {
            const lastMessage = lastMessages?.find(msg => msg.chatroom_id === chatroom.id);
            return {
              ...chatroom,
              last_message: lastMessage?.content || '',
              last_message_time: lastMessage?.created_at || ''
            };
          })
        }))
      }));
      
      setRegions(updatedRegions);
      
      // Fetch membership status for each chatroom
      await fetchMembershipStatus(chatroomIds);
      
      // Fetch online users count for each chatroom
      await fetchOnlineUsers(chatroomIds);
      
      // Fetch unread messages count for each chatroom
      await fetchUnreadMessages(chatroomIds);
      
    } catch (error) {
      console.error('Error in fetchLastMessages:', error);
    }
  };
  
  const fetchMembershipStatus = async (chatroomIds: string[]) => {
    if (!session?.user?.id || chatroomIds.length === 0) return;
    
    try {
      const statuses: { [key: string]: boolean } = {};
      
      for (const chatroomId of chatroomIds) {
        const isMember = await isUserInChatroom(chatroomId, session.user.id);
        statuses[chatroomId] = isMember;
      }
      
      setMembershipStatus(statuses);
    } catch (error) {
      console.error('Error fetching membership status:', error);
    }
  };
  
  const fetchOnlineUsers = async (chatroomIds: string[]) => {
    if (chatroomIds.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from('chatroom_members')
        .select('chatroom_id, count')
        .in('chatroom_id', chatroomIds)
        .eq('is_online', true)
        .group('chatroom_id');
      
      if (error) {
        console.error('Error fetching online users:', error);
        return;
      }
      
      const onlineUsersCount: { [key: string]: number } = {};
      
      data?.forEach(item => {
        onlineUsersCount[item.chatroom_id] = item.count || 0;
      });
      
      setOnlineUsers(onlineUsersCount);
    } catch (error) {
      console.error('Error in fetchOnlineUsers:', error);
    }
  };
  
  const fetchUnreadMessages = async (chatroomIds: string[]) => {
    if (!session?.user?.id || chatroomIds.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from('unread_messages')
        .select('chatroom_id, count')
        .in('chatroom_id', chatroomIds)
        .eq('user_id', session.user.id)
        .group('chatroom_id');
      
      if (error) {
        console.error('Error fetching unread messages:', error);
        return;
      }
      
      const unreadCount: { [key: string]: number } = {};
      
      data?.forEach(item => {
        unreadCount[item.chatroom_id] = item.count || 0;
      });
      
      setUnreadMessages(unreadCount);
    } catch (error) {
      console.error('Error in fetchUnreadMessages:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRegions();
  };

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
  };

  const handleChatroomPress = async (chatroomId: string) => {
    if (!session?.user?.id) {
      Alert.alert('Authentication Required', 'Please sign in to join chat rooms.');
      return;
    }
    
    try {
      const isMember = membershipStatus[chatroomId];
      
      if (!isMember) {
        setJoiningRoom(chatroomId);
        await joinChatroom(chatroomId, session.user.id);
        setMembershipStatus(prev => ({ ...prev, [chatroomId]: true }));
        setJoiningRoom(null);
      }
      
      router.push(`/chatroom/${chatroomId}`);
    } catch (error) {
      console.error('Error joining chatroom:', error);
      Alert.alert('Error', 'Failed to join chat room. Please try again.');
      setJoiningRoom(null);
    }
  };

  const handleCreateChatroom = () => {
    if (!session?.user?.id) {
      Alert.alert('Authentication Required', 'Please sign in to create chat rooms.');
      return;
    }
    
    router.push('/new-message');
  };

  // Animated styles
  const headerAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });

  const contentAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });

  const fabAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: fabScale.value }],
    };
  });

  useEffect(() => {
    fetchRegions();
    
    // Set up real-time listeners
    const chatroomsSubscription = supabase
      .channel('chatrooms-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chatrooms' 
      }, () => {
        fetchRegions();
      })
      .subscribe();
      
    const messagesSubscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, () => {
        fetchRegions();
      })
      .subscribe();
      
    return () => {
      chatroomsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, []);

  const renderRegionButton = (region: Region) => {
    const isSelected = selectedRegion?.id === region.id;
    
    return (
      <Animated.View
        key={region.id}
        entering={SlideInRight.delay(200 + regions.indexOf(region) * 100).duration(400)}
      >
        <TouchableOpacity
          style={[
            styles.regionButton,
            isSelected && styles.selectedRegionButton
          ]}
          onPress={() => handleRegionSelect(region)}
        >
          <Text 
            style={[
              styles.regionButtonText,
              isSelected && styles.selectedRegionButtonText
            ]}
          >
            {region.name}
          </Text>
          {isSelected && (
            <View style={styles.selectedIndicator} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderChatroom = ({ item, index }: { item: any, index: number }) => {
    const isJoining = joiningRoom === item.id;
    const isMember = membershipStatus[item.id];
    const onlineCount = onlineUsers[item.id] || 0;
    const unreadCount = unreadMessages[item.id] || 0;
    
    return (
      <Animated.View entering={FadeInUp.delay(100 * index).duration(400)}>
        <ChatroomItem
          id={item.id}
          name={item.name}
          lastMessage={item.last_message}
          lastMessageTime={item.last_message_time}
          unreadCount={unreadCount}
          onPress={handleChatroomPress}
          isActive={isMember}
          onlineCount={onlineCount}
        />
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View 
      style={styles.emptyContainer}
      entering={FadeIn.duration(400)}
    >
      <Ionicons name="chatbubble-ellipses-outline" size={80} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>No Chat Rooms</Text>
      <Text style={styles.emptyMessage}>There are no chat rooms available in this region yet.</Text>
      <Button
        title="Create a Chat Room"
        onPress={handleCreateChatroom}
        variant="primary"
        style={styles.createButton}
        gradient
      />
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading chat rooms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} />
      
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimStyle]}>
        <Text style={styles.title}>Chat Rooms</Text>
        <Text style={styles.subtitle}>Join conversations across the Philippines</Text>
      </Animated.View>
      
      {/* Regions Horizontal Scroll */}
      <Animated.View style={[styles.regionsContainer, headerAnimStyle]}>
        <FlatList
          data={regions}
          renderItem={({ item }) => renderRegionButton(item)}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.regionsScrollContent}
        />
      </Animated.View>
      
      {/* Chatrooms List */}
      <Animated.View style={[styles.chatroomsContainer, contentAnimStyle]}>
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={40} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Try Again"
              onPress={fetchRegions}
              variant="outline"
              size="small"
              style={styles.retryButton}
            />
          </View>
        ) : (
          <FlatList
            data={selectedRegion?.provinces.flatMap(province => province.chatrooms || []) || []}
            renderItem={renderChatroom}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatroomsScrollContent}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        )}
      </Animated.View>
      
      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, fabAnimStyle]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateChatroom}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={28} color={COLORS.card} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontFamily: 'System',
    fontSize: SIZES.body2,
    fontWeight: 'normal',
    color: COLORS.textSecondary,
    marginTop: SIZES.spacingM,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.spacingM,
  },
  title: {
    fontFamily: 'System',
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacingXS,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: SIZES.body2,
    fontWeight: 'normal',
    color: COLORS.textSecondary,
  },
  regionsContainer: {
    marginBottom: SIZES.spacingM,
  },
  regionsScrollContent: {
    paddingHorizontal: SIZES.padding,
  },
  regionButton: {
    paddingVertical: SIZES.spacingS,
    paddingHorizontal: SIZES.spacingL,
    marginRight: SIZES.spacingS,
    borderRadius: SIZES.radiusRound,
    backgroundColor: COLORS.card,
    ...SHADOWS.light,
  },
  selectedRegionButton: {
    backgroundColor: COLORS.primary,
  },
  regionButtonText: {
    fontFamily: 'System',
    fontSize: SIZES.body3,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  selectedRegionButtonText: {
    color: COLORS.card,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: -4,
  },
  chatroomsContainer: {
    flex: 1,
  },
  chatroomsScrollContent: {
    paddingBottom: 100, // Space for FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    marginTop: SIZES.spacing2XL,
  },
  emptyTitle: {
    fontFamily: 'System',
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.spacingM,
    marginBottom: SIZES.spacingS,
  },
  emptyMessage: {
    fontFamily: 'System',
    fontSize: SIZES.body2,
    fontWeight: 'normal',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacingL,
  },
  createButton: {
    marginTop: SIZES.spacingM,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  errorText: {
    fontFamily: 'System',
    fontSize: SIZES.body2,
    fontWeight: 'normal',
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: SIZES.spacingM,
  },
  retryButton: {
    marginTop: SIZES.spacingM,
  },
  fabContainer: {
    position: 'absolute',
    right: SIZES.padding,
    bottom: SIZES.padding,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    ...SHADOWS.dark,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});