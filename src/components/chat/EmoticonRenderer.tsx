import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import { getEmoticonById } from '../../utils/emoticonUtils';

interface EmoticonRendererProps {
  emoticonId: string;
  size?: number;
  fallbackText?: string;
}

/**
 * Component to render emoticons in chat messages
 */
const EmoticonRenderer: React.FC<EmoticonRendererProps> = ({ 
  emoticonId, 
  size = 24,
  fallbackText
}) => {
  // Get emoticon data from the utility function
  const emoticon = getEmoticonById(emoticonId);

  if (!emoticon) {
    // If emoticon not found, render fallback text
    return fallbackText ? <Text style={styles.fallbackText}>{fallbackText}</Text> : null;
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image 
        source={emoticon.source} 
        style={[styles.image, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackText: {
    fontSize: 16,
    color: '#666',
  }
});

export default EmoticonRenderer;
