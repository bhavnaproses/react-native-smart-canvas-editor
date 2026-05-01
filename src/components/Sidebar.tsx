import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSmartCanvas } from '../Provider';
import { Toolbar } from './Toolbar';
import { LayerPanel } from './LayerPanel';
import { PropertiesPanel } from './PropertiesPanel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 360);

export const Sidebar: React.FC = () => {
  const { state, dispatch, theme } = useSmartCanvas();
  const [activeTab, setActiveTab] = useState<'tools' | 'layers' | 'properties' | 'settings'>('tools');

  const translateX = useSharedValue(-SIDEBAR_WIDTH);

  useEffect(() => {
    translateX.value = withSpring(state.showSidebar ? 0 : -SIDEBAR_WIDTH, {
      damping: 20,
      stiffness: 90,
    });
  }, [state.showSidebar, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: withSpring(state.showSidebar ? 1 : 0),
  }));

  if (!state.showUI && !state.showSidebar) return null;

  const tabs = [
    { id: 'tools', label: 'Tools', icon: '🛠️' },
    { id: 'layers', label: 'Layers', icon: '🥞' },
    { id: 'properties', label: 'Style', icon: '🎨' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ] as const;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={state.showSidebar ? 'auto' : 'none'}>
      {/* Backdrop */}
      {state.showSidebar && (
        <Pressable 
          style={styles.backdropPressable} 
          onPress={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        >
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
      )}

      {/* Sidebar Content */}
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: theme.panel, borderRightColor: theme.border },
          animatedStyle,
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Menu</Text>
          <TouchableOpacity onPress={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}>
            <Text style={[styles.closeIcon, { color: theme.sub }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tab,
                  isActive && { borderBottomColor: theme.primary },
                ]}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? theme.primary : theme.sub },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.content}>
          {activeTab === 'tools' && (
            <Toolbar isVertical={false} isEmbedded />
          )}
          {activeTab === 'layers' && <LayerPanel isEmbedded />}
          {activeTab === 'properties' && <PropertiesPanel isEmbedded />}
          {activeTab === 'settings' && (
             <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.settingRow}>
                    <Text style={{color: theme.text}}>Dark Mode</Text>
                    <TouchableOpacity onPress={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}>
                        <Text style={{color: theme.primary}}>{state.isDarkMode ? 'ON' : 'OFF'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.settingRow}>
                    <Text style={{color: theme.text}}>Predictive Stroke</Text>
                    <TouchableOpacity onPress={() => dispatch({ type: 'TOGGLE_PREDICTIVE_STROKE' })}>
                        <Text style={{color: theme.primary}}>{state.predictiveStroke ? 'ON' : 'OFF'}</Text>
                    </TouchableOpacity>
                </View>
             </ScrollView>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFill,
    zIndex: -1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeIcon: {
    fontSize: 24,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
});
