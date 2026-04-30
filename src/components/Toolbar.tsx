import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSmartCanvas } from '../Provider';

export const Toolbar: React.FC = () => {
  const { height } = useWindowDimensions();
  const { state, dispatch, theme } = useSmartCanvas();

  const tools = [
    { id: 'select', icon: '🎯', label: 'Select' },
    { id: 'pen', icon: '✏️', label: 'Pencil' },
    { id: 'brush', icon: '🖌️', label: 'Brush' },
    { id: 'eraser', icon: '🧽', label: 'Eraser' },
    { id: 'shape', icon: '⬛', label: 'Shape' },
    { id: 'text', icon: 'T', label: 'Text' },
    { id: 'image', icon: '🖼️', label: 'Image' },
    { id: 'stickers', icon: '😊', label: 'Stickers' },
    { id: 'canvas', icon: '🖼️', label: 'Canvas' },
  ];

  return (
    <View style={[styles.container, { top: (height - 450) / 2 }]}>
      <View
        style={[
          styles.floatingPill,
          { backgroundColor: theme.panel, borderColor: theme.border },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {tools.map((item) => {
            const active = state.selectedTool === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  dispatch({ type: 'SET_TOOL', tool: item.id });
                  if (!state.showProperties)
                    dispatch({ type: 'SET_SHOW_PROPERTIES', show: true });
                }}
                style={[
                  styles.toolButton,
                  {
                    backgroundColor: active ? theme.primary : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.toolIcon,
                    { color: active ? '#fff' : theme.text },
                  ]}
                >
                  {item.icon}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.separator} />

          <TouchableOpacity style={styles.colorButton}>
            <View
              style={[
                styles.colorIndicator,
                { backgroundColor: theme.primary },
              ]}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    zIndex: 100,
  },
  floatingPill: {
    width: 58,
    borderRadius: 30,
    paddingVertical: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  scrollContent: {
    alignItems: 'center',
  },
  toolButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toolIcon: {
    fontSize: 20,
  },
  separator: {
    width: 24,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 10,
  },
  colorButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
