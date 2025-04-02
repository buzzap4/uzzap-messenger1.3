import { supabase, checkRateLimit } from '../../lib/supabase';
import { validateMessageContent } from '../../lib/validation';

export const sendMessage = async (content: string, chatroom_id: string) => {
  try {
    // Validate and sanitize the message content
    const contentValidation = validateMessageContent(content);
    if (!contentValidation.valid) {
      return { 
        data: null, 
        error: new Error(contentValidation.message || 'Invalid message content') 
      };
    }

    const sanitizedContent = contentValidation.sanitized || '';

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(session.user.id);
    if (!rateLimitCheck.allowed) {
      return { 
        data: null, 
        error: new Error(rateLimitCheck.message || 'Rate limit exceeded') 
      };
    }

    // First check/create membership
    await supabase
      .from('chatroom_memberships')
      .upsert({ 
        chatroom_id, 
        user_id: session.user.id 
      });

    const { data, error } = await supabase
      .from('messages')
      .insert({
        content: sanitizedContent,
        chatroom_id,
        user_id: session.user.id,
      })
      .select(`
        id,
        content,
        created_at,
        is_edited,
        is_deleted,
        user:profiles!messages_user_id_fkey (*)
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error sending message');
    return { data: null, error };
  }
};

export const fetchMessages = async (chatroom_id: string) => {
  try {
    const { data: rawData, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        is_edited,
        is_deleted,
        chatroom_id,
        user_id,
        user:profiles!messages_user_id_fkey (
          id,
          username,
          avatar_url,
          display_name,
          status_message,
          role,
          created_at,
          updated_at
        )
      `)
      .eq('chatroom_id', chatroom_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const data = rawData?.map(message => ({
      id: message.id,
      content: message.content,
      user_id: message.user_id,
      chatroom_id: message.chatroom_id,
      created_at: message.created_at,
      is_edited: message.is_edited || false,
      is_deleted: message.is_deleted || false,
      user: Array.isArray(message.user) ? message.user[0] : message.user
    }));

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching messages');
    return { data: null, error };
  }
};

export const setupMessageSubscription = (chatroomId: string, onMessage: (message: any) => void) => {
  return supabase
    .channel(`chatroom:${chatroomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chatroom_id=eq.${chatroomId}`,
      },
      (payload) => {
        onMessage(payload.new);
      }
    )
    .subscribe();
};
