import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSmartCanvas } from '../Provider';

export const QuickActions: React.FC = () => {
  const { state, dispatch, theme } = useSmartCanvas();

  const actions = [
    { id: 'lock', icon: '🔒', label: 'Lock' },
    { id: 'duplicate', icon: '👯', label: 'Duplicate' },
    { id: 'delete', icon: '🗑', label: 'Delete' },
  ];

  const handleAction = (id: string) => {
    if (id === 'delete' && state.selectedElementId) {
      dispatch({
        type: 'UPDATE_ELEMENT',
        id: state.selectedElementId,
        updates: { opacity: 0 },
      }); // Mock delete
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.panel,
          { backgroundColor: theme.panel, borderColor: theme.border },
        ]}
      >
        {actions.map((action, index) => (
          <React.Fragment key={action.id}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAction(action.id)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={[styles.actionLabel, { color: theme.text }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
            {index < actions.length - 1 && (
              <View
                style={[styles.separator, { backgroundColor: theme.border }]}
              />
            )}
          </React.Fragment>
        ))}
        <TouchableOpacity style={styles.moreButton}>
          <Text style={[styles.moreText, { color: theme.text }]}>•••</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const ZoomControls: React.FC = () => {
  const { theme } = useSmartCanvas();

  return (
    <View style={styles.zoomContainer}>
      <View
        style={[
          styles.zoomPanel,
          { backgroundColor: theme.panel, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity style={styles.zoomButton}>
          <Text style={[styles.zoomIcon, { color: theme.text }]}>−</Text>
        </TouchableOpacity>
        <View style={styles.zoomTextContainer}>
          <Text style={[styles.zoomText, { color: theme.text }]}>100%</Text>
        </View>
        <TouchableOpacity style={styles.zoomButton}>
          <Text style={[styles.zoomIcon, { color: theme.text }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: '35%',
    zIndex: 100,
  },
  panel: {
    width: 64,
    borderRadius: 32,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionLabel: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: '600',
  },
  separator: {
    width: 32,
    height: 1,
    marginVertical: 8,
  },
  moreButton: {
    marginTop: 4,
  },
  moreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  zoomContainer: {
    position: 'absolute',
    right: 16,
    top: 70, // Positioned just below the Topbar (which is ~60px high)
    zIndex: 100,
  },
  zoomPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  zoomButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  zoomTextContainer: {
    paddingHorizontal: 12,
  },
  zoomText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
