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

export const Toolbar: React.FC<{ isVertical?: boolean; isEmbedded?: boolean }> = ({ 
  isVertical = true, 
  isEmbedded = false 
}) => {
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
    <View style={!isEmbedded ? [styles.container, { top: (height - 450) / 2 }] : styles.embeddedContainer}>
      <View
        style={[
          !isEmbedded ? styles.floatingPill : styles.embeddedPill,
          { backgroundColor: isEmbedded ? 'transparent' : theme.panel, borderColor: isEmbedded ? 'transparent' : theme.border },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={isVertical ? styles.scrollContent : styles.horizontalScrollContent}
        >
          {tools.map((item) => {
            const active = state.selectedTool === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  dispatch({ type: 'SET_TOOL', tool: item.id });
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
                {isEmbedded && !isVertical && (
                  <Text
                    style={[
                      styles.toolLabel,
                      { color: active ? '#fff' : theme.sub },
                    ]}
                  >
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
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
  embeddedContainer: {
    width: '100%',
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
  embeddedPill: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
  },
  horizontalScrollContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 10,
  },
  toolButton: {
    width: '31%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    marginHorizontal: '1%',
    borderRadius: 12,
  },
  toolIcon: {
    fontSize: 24,
  },
  toolLabel: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: '600',
  },
  separator: {
    width: 24,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 10,
  },
});
