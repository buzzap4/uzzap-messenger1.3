import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Message, User } from '../types/models';

const PAGE_SIZE = 20;

// Update the database response type to match Supabase's structure
interface MessageRow {
  id: string;
  content: string;
  created_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  chatroom_id: string;
  user_id: string;
  bubble_color?: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
    display_name: string | null;
    status_message: string | null;
    role: 'user' | 'admin' | 'moderator';
    created_at: string;
    updated_at: string;
  };
}

interface MessagesState {
  messages: Message[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
}

export const useMessages = (chatroomId: string) => {
  const [state, setState] = useState<MessagesState>({
    messages: [],
    loading: false,
    hasMore: true,
    error: null
  });
  
  const isMounted = useRef(true);

  // Set up cleanup function to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!chatroomId) {
      setState((prev: MessagesState) => ({
        ...prev,
        loading: false,
        error: 'Invalid chatroom ID'
      }));
      return;
    }

    try {
      const { data: rawData, error } = await supabase
        .from('messages')
        .select(`
          *,
          user:profiles!messages_user_id_fkey (
            id,
            username,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('chatroom_id', chatroomId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      // Check if component is still mounted before updating state
      if (!isMounted.current) return;

      const messages = (rawData as unknown as MessageRow[])?.map(message => {
        try {
          const userProfile: User = {
            id: message.profiles.id,
            username: message.profiles.username,
            avatar_url: message.profiles.avatar_url,
            display_name: message.profiles.display_name || undefined,
            status_message: message.profiles.status_message || undefined,
            role: message.profiles.role,
            created_at: message.profiles.created_at,
            updated_at: message.profiles.updated_at
          };

          return {
            id: message.id,
            content: message.content,
            user_id: message.user_id,
            created_at: message.created_at,
            chatroom_id: message.chatroom_id,
            is_edited: message.is_edited || false,
            is_deleted: message.is_deleted || false,
            bubble_color: message.bubble_color || undefined,
            user: userProfile
          } satisfies Message;
        } catch (err) {
          console.error('Error processing message:', err, message);
          // Return a simplified message if there's an error processing it
          return {
            id: message.id,
            content: message.content,
            user_id: message.user_id,
            created_at: message.created_at,
            chatroom_id: message.chatroom_id,
            is_edited: message.is_edited || false,
            is_deleted: message.is_deleted || false,
          } as Message;
        }
      }) || [];

      setState({
        messages,
        loading: false,
        hasMore: messages.length === PAGE_SIZE,
        error: null
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      setState((prev: MessagesState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch messages'
      }));
    }
  }, [chatroomId]);

  const loadMessages = useCallback(async () => {
    try {
      setState((prev: MessagesState) => ({ ...prev, loading: true, error: null }));
      await fetchMessages();
    } catch (error) {
      console.error('Error loading messages:', error);
      
      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      setState((prev: MessagesState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load messages'
      }));
    }
  }, [fetchMessages]);

  const refresh = useCallback(async () => {
    setState((prev: MessagesState) => ({ ...prev, loading: true }));
    try {
      await fetchMessages();
    } catch (error) {
      console.error('Error refreshing messages:', error);
      
      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      setState((prev: MessagesState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh messages'
      }));
    }
  }, [fetchMessages]);

  const addMessage = useCallback((message: Message) => {
    setState((prev: MessagesState) => ({
      ...prev,
      messages: [message, ...prev.messages]
    }));
  }, []);

  // Initial load of messages
  useEffect(() => {
    loadMessages();
  }, [chatroomId, loadMessages]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!chatroomId) return;

    const subscription = supabase
      .channel(`public:messages:chatroom_id=eq.${chatroomId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chatroom_id=eq.${chatroomId}`
        }, 
        (payload: any) => {
          // Fetch the complete message with user data
          const fetchCompleteMessage = async () => {
            try {
              const { data, error } = await supabase
                .from('messages')
                .select(`
                  *,
                  user:profiles!messages_user_id_fkey (
                    id,
                    username,
                    avatar_url,
                    created_at,
                    updated_at
                  )
                `)
                .eq('id', payload.new.id)
                .single();

              if (error) throw error;
              if (!data) return;
              
              // Check if component is still mounted before updating state
              if (!isMounted.current) return;

              // Add the new message to the state
              setState((prev: MessagesState) => {
                // Check if the message is already in the list
                const messageExists = prev.messages.some((msg: Message) => msg.id === data.id);
                if (messageExists) return prev;
                
                return {
                  ...prev,
                  messages: [data as unknown as Message, ...prev.messages]
                };
              });
            } catch (err) {
              console.error('Error fetching complete message:', err);
            }
          };

          fetchCompleteMessage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [chatroomId]);

  return {
    ...state,
    refresh,
    addMessage
  };
};
