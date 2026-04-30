import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSmartCanvas } from '../Provider';

export const Topbar: React.FC = () => {
  const { state, dispatch, theme } = useSmartCanvas();

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.leftGroup}>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={[styles.icon, { color: theme.text }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.undoRedoGroup}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => dispatch({ type: 'UNDO' })}
            disabled={!canUndo}
          >
            <Text
              style={[
                styles.icon,
                { color: theme.text, opacity: canUndo ? 1 : 0.3 },
              ]}
            >
              ↶
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => dispatch({ type: 'REDO' })}
            disabled={!canRedo}
          >
            <Text
              style={[
                styles.icon,
                { color: theme.text, opacity: canRedo ? 1 : 0.3 },
              ]}
            >
              ↷
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rightGroup}>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={[styles.icon, { color: theme.text }]}>≡</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={[styles.icon, { color: theme.text }]}>•••</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: theme.primary }]}
          onPress={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
        >
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  undoRedoGroup: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  icon: {
    fontSize: 22,
    fontWeight: '600',
  },
  exportButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
