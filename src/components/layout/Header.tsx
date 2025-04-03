import React, { useState, useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Platform, Modal, TextInput, Alert, StatusBar } from 'react-native';
import { useTheme } from '@/context/theme';
import { useNavigation, usePathname, router } from 'expo-router';
import { ArrowLeft, Search, MoreVertical, X, Bell } from 'lucide-react-native';
import { useAuth } from '@/context/auth';
import NotificationsModal from '../notifications/NotificationsModal';
import { supabase } from '@/lib/supabase';

interface MenuOption {
  label: string;
  onPress: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
}

export default function Header() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        setNotifications(data || []);
        setUnreadCount((data?.filter((n: Notification) => !n.read)?.length) || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const isMainTab = ['/', '/rooms', '/direct-messages', '/profile', '/settings'].includes(pathname);
  const showSearchIcon = ['/', '/rooms', '/direct-messages'].includes(pathname);

  const menuOptions: MenuOption[] = [
    {
      label: 'New Message',
      onPress: () => {
        setShowMenu(false);
        router.push('/new-message');
      },
    },
    {
      label: 'Settings',
      onPress: () => {
        setShowMenu(false);
        router.push('/settings');
      },
    },
    {
      label: 'Log Out',
      onPress: async () => {
        setShowMenu(false);
        try {
          await signOut();
        } catch {
          Alert.alert('Error', 'Failed to log out');
        }
      },
    },
  ];

  const handleSearch = () => {
    // Implement search based on current route
    switch (pathname) {
      case '/':
        // Search chats
        break;
      case '/rooms':
        // Search rooms
        break;
      case '/direct-messages':
        // Search messages
        break;
    }
  };

  const getTitle = () => {
    const routeTitles: Record<string, string> = {
      '/': 'Chats',
      '/rooms': 'Chat Rooms',
      '/direct-messages': 'Messages',
      '/profile': 'Profile',
      '/settings': 'Settings',
      '/new-message': 'New Message',
      '/chatroom': 'Chat Room',
    };

    // Handle dynamic routes
    if (pathname.startsWith('/chatroom/')) return 'Chat Room';
    if (pathname.startsWith('/direct-message/')) return 'Message';
    
    return routeTitles[pathname] || '';
  };

  return (
    <>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.leftContainer}>
          {!isMainTab ? (
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.iconButton}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <Image 
              source={require('@/assets/images/favicon.png')} 
              style={styles.favicon}
              accessibilityLabel="App logo"
            />
          )}
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>{getTitle()}</Text>
        
        <View style={styles.rightContainer}>
          {showSearchIcon && (
            <TouchableOpacity 
              onPress={() => setShowSearch(true)} 
              style={styles.iconButton}
              accessibilityLabel="Search"
            >
              <Search size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={() => setShowNotifications(true)} 
            style={styles.iconButton}
            accessibilityLabel="Notifications"
          >
            <Bell size={24} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowMenu(true)} 
            style={styles.iconButton}
            accessibilityLabel="Menu"
          >
            <MoreVertical size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Modal */}
      <Modal
        visible={showSearch}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSearch(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.searchHeader}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search..."
              placeholderTextColor={colors.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              autoFocus
            />
            <TouchableOpacity 
              onPress={() => setShowSearch(false)}
              style={styles.closeButton}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={option.onPress}
              >
                <Text style={[styles.menuText, { color: colors.text }]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 30, // Add padding for Android
    height: Platform.OS === 'ios' ? 90 : 60 + (StatusBar.currentHeight || 0), // Adjust height for Android
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingHorizontal: 16,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  favicon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#28A745',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 2,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginRight: 16,
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
