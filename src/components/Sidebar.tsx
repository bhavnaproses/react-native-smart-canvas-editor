import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSmartCanvas } from '../Provider';

export const Sidebar: React.FC = () => {
  const { theme } = useSmartCanvas();

  const properties = [
    { label: 'Fill Color', value: '#6366F1' },
    { label: 'Stroke Width', value: '2px' },
    { label: 'Opacity', value: '100%' },
    { label: 'Rotate', value: '0°' },
    { label: 'Layer Order', value: 'Top' },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.panel, borderLeftColor: theme.border },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>Properties</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {properties.map((item, index) => (
          <View
            key={index}
            style={[
              styles.propertyCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.propertyLabel, { color: theme.sub }]}>
              {item.label}
            </Text>
            <Text style={[styles.propertyValue, { color: theme.text }]}>
              {item.value}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    borderLeftWidth: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  propertyCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  propertyLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  propertyValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
