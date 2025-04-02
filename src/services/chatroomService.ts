import { supabase } from '../../lib/supabase';

export const joinChatroom = async (chatroomId: string) => {
  try {
    if (!chatroomId) {
      return { error: new Error('Invalid chatroom ID') };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { error: new Error('No active session') };
    }

    // First check if the chatroom exists
    const { data: chatroomData, error: chatroomError } = await supabase
      .from('chatrooms')
      .select('id')
      .eq('id', chatroomId)
      .single();

    if (chatroomError || !chatroomData) {
      return { error: new Error('Chatroom not found') };
    }

    // Check if the user is already a member
    const { data: membershipData, error: membershipError } = await supabase
      .from('chatroom_memberships')
      .select('*')
      .eq('chatroom_id', chatroomId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    // If there's already a membership, return success
    if (membershipData) {
      return { error: null };
    }

    // If there was an error checking membership other than "not found", return it
    if (membershipError && membershipError.code !== 'PGRST116') {
      return { error: new Error(`Membership check failed: ${membershipError.message}`) };
    }

    // Insert new membership
    const { error } = await supabase
      .from('chatroom_memberships')
      .insert({
        chatroom_id: chatroomId,
        user_id: session.user.id,
      });

    if (error) {
      console.error('Error joining chatroom:', error);
      return { error: new Error(`Failed to join chatroom: ${error.message}`) };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error joining chatroom:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error joining chatroom') };
  }
};

export const leaveChatroom = async (chatroomId: string) => {
  try {
    if (!chatroomId) {
      return { error: new Error('Invalid chatroom ID') };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { error: new Error('No active session') };
    }

    const { error } = await supabase
      .from('chatroom_memberships')
      .delete()
      .match({ chatroom_id: chatroomId, user_id: session.user.id });

    if (error) {
      console.error('Error leaving chatroom:', error);
      return { error: new Error(`Failed to leave chatroom: ${error.message}`) };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Unexpected error leaving chatroom:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error leaving chatroom') };
  }
};

export const isUserInChatroom = async (chatroomId: string, userId: string) => {
  try {
    if (!chatroomId || !userId) {
      return { data: false, error: new Error('Invalid chatroom ID or user ID') };
    }

    const { data, error } = await supabase
      .from('chatroom_memberships')
      .select('chatroom_id')
      .eq('chatroom_id', chatroomId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking chatroom membership:', error);
      return { data: false, error: new Error(`Membership check failed: ${error.message}`) };
    }

    // Return true if there is a matching record
    return { data: !!data, error: null };
  } catch (error) {
    console.error('Unexpected error checking chatroom membership:', error);
    return { data: false, error: error instanceof Error ? error : new Error('Unknown error checking membership') };
  }
};

export const verifyOrJoinChatroom = async (chatroomId: string, userId: string) => {
  try {
    if (!chatroomId || !userId) {
      return { success: false, error: new Error('Invalid chatroom ID or user ID') };
    }

    // First check if user is already a member
    const { data: isMember, error: membershipError } = await isUserInChatroom(chatroomId, userId);
    
    if (membershipError) {
      return { success: false, error: membershipError };
    }
    
    if (isMember) {
      return { success: true, error: null };
    }
    
    // If not a member, try to join
    const { error: joinError } = await supabase
      .from('chatroom_memberships')
      .insert({ chatroom_id: chatroomId, user_id: userId });
    
    if (joinError) {
      console.error('Error joining chatroom:', joinError);
      return { success: false, error: new Error(`Failed to join chatroom: ${joinError.message}`) };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error in verifyOrJoinChatroom:', error);
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error verifying chatroom') };
  }
};
