import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  Image,
  TextInput,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { X, Search } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../theme';
import { 
  EMOTICON_CATEGORIES, 
  EMOTICONS, 
  Emoticon, 
  getEmoticonsByCategory, 
  searchEmoticons,
  addRecentEmoticon
} from '../../utils/emoticonUtils';

interface EmojiModalProps {
  visible: boolean;
  onClose: () => void;
  onEmojiSelect: (emoticonId: string, emoticonSource: any) => void;
}



const EmojiModal: React.FC<EmojiModalProps> = ({ visible, onClose, onEmojiSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const [emoticons, setEmoticons] = useState<Emoticon[]>([]);
  const [loading, setLoading] = useState(false);

  // Load emoticons based on selected category
  useEffect(() => {
    if (!visible) return;
    
    setLoading(true);
    // Small delay to show loading indicator (makes UI feel more responsive)
    setTimeout(() => {
      const categoryEmoticons = getEmoticonsByCategory(selectedCategory);
      setEmoticons(categoryEmoticons);
      setLoading(false);
    }, 300);
  }, [selectedCategory, visible]);

  // Filter emoticons based on search query
  useEffect(() => {
    if (!visible) return;
    
    if (searchQuery.trim() === '') {
      // If search is cleared, show emoticons from selected category
      const categoryEmoticons = getEmoticonsByCategory(selectedCategory);
      setEmoticons(categoryEmoticons);
    } else {
      setLoading(true);
      // Small delay to show loading indicator (makes UI feel more responsive)
      setTimeout(() => {
        const searchResults = searchEmoticons(searchQuery);
        setEmoticons(searchResults);
        setLoading(false);
      }, 300);
    }
  }, [searchQuery, visible]);

  const renderCategoryItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => {
        setSearchQuery('');
        setSelectedCategory(item.id);
      }}
    >
      <Text 
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderEmoticonItem = ({ item }: { item: Emoticon }) => (
    <TouchableOpacity
      style={styles.emojiItem}
      onPress={() => {
        // Add to recent emoticons
        addRecentEmoticon(item.id);
        // Pass both the ID and source to the parent component
        onEmojiSelect(item.id, item.source);
        onClose();
      }}
      activeOpacity={0.7}
    >
      <Image source={item.source} style={styles.emoticonImage} resizeMode="contain" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Emoticons</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search emoticons..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.categoriesContainer}>
            <FlatList
              data={EMOTICON_CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : emoticons.length > 0 ? (
            <FlatList
              data={emoticons}
              renderItem={renderEmoticonItem}
              keyExtractor={(item) => item.id}
              numColumns={5}
              contentContainerStyle={styles.emojiList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No emoticons found</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');
const emojiSize = width / 10; // Adjust based on screen size

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesList: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  selectedCategoryItem: {
    backgroundColor: COLORS.primaryLight,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  selectedCategoryText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  emojiList: {
    padding: 12,
  },
  emojiItem: {
    width: emojiSize,
    height: emojiSize,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  emoticonImage: {
    width: emojiSize * 0.8,
    height: emojiSize * 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default EmojiModal;
