import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSmartCanvas } from '../Provider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LayerPanel: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
  const { state, dispatch, theme } = useSmartCanvas();

  if (!state.showUI && !isEmbedded) return null;

  return (
    <View
      style={[
        !isEmbedded ? styles.container : styles.embeddedContainer,
        { backgroundColor: isEmbedded ? 'transparent' : theme.panel, borderColor: isEmbedded ? 'transparent' : theme.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Layers</Text>
        <TouchableOpacity
          onPress={() => dispatch({ type: 'ADD_LAYER' })}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {state.layers.map((layer) => {
          const isActive = state.activeLayerId === layer.id;
          return (
            <TouchableOpacity
              key={layer.id}
              onPress={() => dispatch({ type: 'SET_ACTIVE_LAYER', id: layer.id })}
              style={[
                styles.layerItem,
                {
                  backgroundColor: isActive ? theme.card : 'transparent',
                  borderColor: isActive ? theme.primary : 'transparent',
                },
              ]}
            >
              <View style={styles.layerInfo}>
                <Text
                  style={[
                    styles.layerName,
                    { color: isActive ? theme.primary : theme.text },
                  ]}
                >
                  {layer.name}
                </Text>
                <Text style={[styles.elementCount, { color: theme.sub }]}>
                  {layer.elements.length} elements
                </Text>
              </View>

              <View style={styles.layerActions}>
                <TouchableOpacity
                  onPress={() =>
                    dispatch({
                      type: 'UPDATE_LAYER',
                      id: layer.id,
                      updates: { visible: !layer.visible },
                    })
                  }
                  style={styles.actionButton}
                >
                  <Text style={{ fontSize: 16 }}>{layer.visible ? '👁️' : '🕶️'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    dispatch({
                      type: 'UPDATE_LAYER',
                      id: layer.id,
                      updates: { locked: !layer.locked },
                    })
                  }
                  style={styles.actionButton}
                >
                  <Text style={{ fontSize: 16 }}>{layer.locked ? '🔒' : '🔓'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {state.activeLayerId && (
        <View style={styles.footer}>
          <Text style={[styles.footerLabel, { color: theme.sub }]}>Opacity</Text>
          <View style={styles.sliderPlaceholder}>
             {/* Replace with actual slider if available, using simple buttons for now */}
             <TouchableOpacity 
              onPress={() => {
                const l = state.layers.find(l => l.id === state.activeLayerId);
                if (l) dispatch({ type: 'UPDATE_LAYER', id: l.id, updates: { opacity: Math.max(0, l.opacity - 0.1) } });
              }}
             >
                <Text style={{color: theme.primary}}>-</Text>
             </TouchableOpacity>
             <Text style={{color: theme.text, marginHorizontal: 10}}>
                {Math.round((state.layers.find(l => l.id === state.activeLayerId)?.opacity || 0) * 100)}%
             </Text>
             <TouchableOpacity
              onPress={() => {
                const l = state.layers.find(l => l.id === state.activeLayerId);
                if (l) dispatch({ type: 'UPDATE_LAYER', id: l.id, updates: { opacity: Math.min(1, l.opacity + 0.1) } });
              }}
             >
                <Text style={{color: theme.primary}}>+</Text>
             </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: 100,
    width: 200,
    maxHeight: SCREEN_HEIGHT - 200,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  embeddedContainer: {
    width: '100%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    flexGrow: 0,
  },
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
  },
  layerInfo: {
    flex: 1,
  },
  layerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  elementCount: {
    fontSize: 10,
    marginTop: 2,
  },
  layerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 4,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  footerLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  sliderPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
