-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Users can view any profile" ON profiles;

-- Create more restrictive profile viewing policy
CREATE POLICY "Users can view profiles with restrictions"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        -- Users can view their own profile
        auth.uid() = id
        -- Users can view profiles of users they have conversations with
        OR id IN (
            SELECT user1_id FROM conversations WHERE user2_id = auth.uid()
            UNION
            SELECT user2_id FROM conversations WHERE user1_id = auth.uid()
        )
        -- Users can view profiles of users in the same chatrooms
        OR id IN (
            SELECT cm.user_id 
            FROM chatroom_memberships cm
            JOIN chatroom_memberships my_cm ON cm.chatroom_id = my_cm.chatroom_id
            WHERE my_cm.user_id = auth.uid()
        )
        -- Users cannot view profiles they have blocked or that have blocked them
        AND id NOT IN (
            SELECT blocked_id FROM user_blocks WHERE blocker_id = auth.uid()
            UNION
            SELECT blocker_id FROM user_blocks WHERE blocked_id = auth.uid()
        )
    );

-- Add additional security to message policies
DROP POLICY IF EXISTS "Users can view messages in their chatrooms" ON messages;

CREATE POLICY "Users can view messages in their chatrooms with restrictions"
    ON messages FOR SELECT
    TO authenticated
    USING (
        -- User is a member of the chatroom
        chatroom_id IN (
            SELECT chatroom_id 
            FROM chatroom_memberships 
            WHERE user_id = auth.uid()
        )
        -- User has not blocked the message sender
        AND user_id NOT IN (
            SELECT blocked_id 
            FROM user_blocks 
            WHERE blocker_id = auth.uid()
        )
    );

-- Add additional security to direct messages
DROP POLICY IF EXISTS "Users can view their direct messages" ON direct_messages;

CREATE POLICY "Users can view their direct messages with restrictions"
    ON direct_messages FOR SELECT
    TO authenticated
    USING (
        -- User is the sender or receiver
        (sender_id = auth.uid() OR receiver_id = auth.uid())
        -- User has not blocked the other party
        AND (
            (sender_id = auth.uid() AND receiver_id NOT IN (
                SELECT blocked_id FROM user_blocks WHERE blocker_id = auth.uid()
            ))
            OR
            (receiver_id = auth.uid() AND sender_id NOT IN (
                SELECT blocked_id FROM user_blocks WHERE blocker_id = auth.uid()
            ))
        )
    );

-- Add row-level security to the rate_limits table
ALTER TABLE IF EXISTS rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policies for rate_limits
CREATE POLICY "Users can only view their own rate limits"
    ON rate_limits FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can only update their own rate limits"
    ON rate_limits FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own rate limits"
    ON rate_limits FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Add a policy for moderators to view any profile
CREATE POLICY "Moderators can view any profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    );

-- Add a policy for moderators to moderate messages
CREATE POLICY "Moderators can update any message"
    ON messages FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    );
