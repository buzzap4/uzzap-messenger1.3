import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { Region } from '@/types/Region';
import { COLORS, FONTS, SHADOWS } from '../../theme';

interface RegionDropdownProps {
  regions: Region[];
  selectedRegion: Region | null;
  onSelect: (region: Region) => void;
  label?: string;
}

export default function RegionDropdown({ 
  regions, 
  selectedRegion, 
  onSelect,
  label = 'Select Region'
}: RegionDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.selectedText}>
          {selectedRegion?.name || label}
        </Text>
        <ChevronDown size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={regions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.regionItem,
                    selectedRegion?.id === item.id && styles.selectedRegionItem
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.regionText,
                      selectedRegion?.id === item.id && styles.selectedRegionText
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 16,
    ...SHADOWS.light,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
  },
  regionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  selectedRegionItem: {
    backgroundColor: COLORS.primaryLight + '20',
  },
  regionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedRegionText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
