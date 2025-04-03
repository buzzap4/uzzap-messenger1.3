/**
 * Utility functions for handling emoticons in the app
 */

// Define emoticon categories
export const EMOTICON_CATEGORIES = [
  { id: 'recent', name: 'Recently Used' },
  { id: 'smileys', name: 'Smileys & Emotion' },
  { id: 'people', name: 'People & Heads' },
  { id: 'special', name: 'Special' },
];

// Define emoticon data with categories
export interface Emoticon {
  id: string;
  source: any;
  category: string;
  keywords: string[];
}

// Map emoticons to their categories and add search keywords
export const EMOTICONS: Emoticon[] = [
  // Smileys & Emotion category
  { 
    id: 'smile', 
    source: require('../../assets/emoticons/emoticon-smile.png'),
    category: 'smileys',
    keywords: ['smile', 'happy', 'grin']
  },
  { 
    id: 'laugh', 
    source: require('../../assets/emoticons/emoticon-laugh.png'),
    category: 'smileys',
    keywords: ['laugh', 'lol', 'haha']
  },
  { 
    id: 'wink', 
    source: require('../../assets/emoticons/emoticon-wink.png'),
    category: 'smileys',
    keywords: ['wink', 'flirt']
  },
  { 
    id: 'tongue', 
    source: require('../../assets/emoticons/emoticon-tongue.png'),
    category: 'smileys',
    keywords: ['tongue', 'silly', 'playful']
  },
  { 
    id: 'sad', 
    source: require('../../assets/emoticons/emoticon-sad.png'),
    category: 'smileys',
    keywords: ['sad', 'unhappy', 'frown']
  },
  { 
    id: 'cry', 
    source: require('../../assets/emoticons/emoticon-cry.png'),
    category: 'smileys',
    keywords: ['cry', 'tears', 'sad']
  },
  { 
    id: 'angry', 
    source: require('../../assets/emoticons/emoticon-angry.png'),
    category: 'smileys',
    keywords: ['angry', 'mad', 'rage']
  },
  { 
    id: 'surprise', 
    source: require('../../assets/emoticons/emoticon-surprise.png'),
    category: 'smileys',
    keywords: ['surprise', 'shocked', 'wow']
  },
  { 
    id: 'love', 
    source: require('../../assets/emoticons/emoticon-love.png'),
    category: 'smileys',
    keywords: ['love', 'heart', 'adore']
  },
  { 
    id: 'clown', 
    source: require('../../assets/emoticons/emoticon-clown.png'),
    category: 'smileys',
    keywords: ['clown', 'joker', 'funny']
  },
  { 
    id: 'sick', 
    source: require('../../assets/emoticons/emoticon-sick.png'),
    category: 'smileys',
    keywords: ['sick', 'ill', 'unwell']
  },
  { 
    id: 'e', 
    source: require('../../assets/emoticons/emoticon-e.png'),
    category: 'smileys',
    keywords: ['e', 'weird', 'strange']
  },
  
  // Special category
  { 
    id: 'party', 
    source: require('../../assets/emoticons/emoticon-party.png'),
    category: 'special',
    keywords: ['party', 'celebrate', 'fun']
  },
  { 
    id: 'drink', 
    source: require('../../assets/emoticons/emoticon-drink.png'),
    category: 'special',
    keywords: ['drink', 'coffee', 'tea']
  },
  { 
    id: 'rose', 
    source: require('../../assets/emoticons/emoticon-rose.png'),
    category: 'special',
    keywords: ['rose', 'flower', 'romance']
  },
  { 
    id: 'ghost', 
    source: require('../../assets/emoticons/ghost.png'),
    category: 'special',
    keywords: ['ghost', 'spooky', 'halloween']
  },
  { 
    id: 'gift', 
    source: require('../../assets/emoticons/gift.png'),
    category: 'special',
    keywords: ['gift', 'present', 'birthday']
  },
  
  // People & Heads category
  { 
    id: 'head-buntis', 
    source: require('../../assets/emoticons/head-buntis.png'),
    category: 'people',
    keywords: ['buntis', 'head', 'avatar']
  },
  { 
    id: 'head-deckard', 
    source: require('../../assets/emoticons/head-deckard.png'),
    category: 'people',
    keywords: ['deckard', 'head', 'avatar']
  },
  { 
    id: 'head-jp', 
    source: require('../../assets/emoticons/head-jp.png'),
    category: 'people',
    keywords: ['jp', 'head', 'avatar']
  },
  { 
    id: 'head-kool', 
    source: require('../../assets/emoticons/head-kool.png'),
    category: 'people',
    keywords: ['kool', 'head', 'avatar']
  },
  { 
    id: 'head-lupz', 
    source: require('../../assets/emoticons/head-lupz.png'),
    category: 'people',
    keywords: ['lupz', 'head', 'avatar']
  },
  { 
    id: 'head-requiem', 
    source: require('../../assets/emoticons/head-requiem.png'),
    category: 'people',
    keywords: ['requiem', 'head', 'avatar']
  },
  { 
    id: 'head-root', 
    source: require('../../assets/emoticons/head-root.png'),
    category: 'people',
    keywords: ['root', 'head', 'avatar']
  },
  { 
    id: 'head-saiyan', 
    source: require('../../assets/emoticons/head-saiyan.png'),
    category: 'people',
    keywords: ['saiyan', 'head', 'avatar']
  },
  { 
    id: 'head-valkyrie', 
    source: require('../../assets/emoticons/head-valkyrie.png'),
    category: 'people',
    keywords: ['valkyrie', 'head', 'avatar']
  },
  
  // Numbered emoticons (adding a few as examples)
  { 
    id: 'emoticon-11', 
    source: require('../../assets/emoticons/emoticon-11.png'),
    category: 'smileys',
    keywords: ['11', 'number', 'emoticon']
  },
  { 
    id: 'emoticon-12', 
    source: require('../../assets/emoticons/emoticon-12.png'),
    category: 'smileys',
    keywords: ['12', 'number', 'emoticon']
  },
  { 
    id: 'emoticon-13', 
    source: require('../../assets/emoticons/emoticon-13.png'),
    category: 'smileys',
    keywords: ['13', 'number', 'emoticon']
  },
  { 
    id: 'emoticon-47', 
    source: require('../../assets/emoticons/emoticon-47.png'),
    category: 'smileys',
    keywords: ['47', 'number', 'emoticon']
  },
];

// Get emoticons by category
export const getEmoticonsByCategory = (categoryId: string): Emoticon[] => {
  if (categoryId === 'recent') {
    // For recent category, we would normally fetch from storage
    // For now, just return a few random emoticons
    return EMOTICONS.slice(0, 8);
  }
  
  return EMOTICONS.filter(emoticon => emoticon.category === categoryId);
};

// Search emoticons by keyword
export const searchEmoticons = (query: string): Emoticon[] => {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return EMOTICONS.filter(emoticon => 
    emoticon.id.toLowerCase().includes(normalizedQuery) || 
    emoticon.keywords.some(keyword => keyword.toLowerCase().includes(normalizedQuery))
  );
};

// Store recently used emoticons (to be implemented with AsyncStorage)
export const addRecentEmoticon = (emoticonId: string): void => {
  // This would normally save to AsyncStorage
  console.log(`Added ${emoticonId} to recent emoticons`);
};

// Get emoticon by ID
export const getEmoticonById = (id: string): Emoticon | undefined => {
  return EMOTICONS.find(emoticon => emoticon.id === id);
};
