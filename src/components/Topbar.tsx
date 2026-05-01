import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSmartCanvas } from '../Provider';
import { elementsToSVG } from '../utils/svgGenerator';

export const Topbar: React.FC = () => {
  const { state, dispatch, theme, onSave } = useSmartCanvas();
  const { width, height } = useWindowDimensions();

  const handleSave = () => {
    if (onSave) {
      // Flatten elements for SVG generation
      const allElements = state.layers.flatMap((l) =>
        l.elements.map((el) => ({ ...el, opacity: el.opacity * l.opacity }))
      );
      const svg = elementsToSVG(allElements, width, height);
      onSave({ elements: allElements, svg });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        >
          <Text style={[styles.icon, { color: theme.text }]}>☰</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightGroup}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 24,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
