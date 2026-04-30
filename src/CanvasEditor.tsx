import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CanvasView } from './components/CanvasView';
import { Topbar } from './components/Topbar';
import { QuickActions, ZoomControls } from './components/QuickActions';
import { PropertiesPanel } from './components/PropertiesPanel';
import { SmartCanvasProvider, useSmartCanvas } from './Provider';
import type { CanvasEditorProps } from './types';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditorLayout: React.FC<CanvasEditorProps> = (_props) => {
  const { state, theme } = useSmartCanvas();

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar
          barStyle={state.isDarkMode ? 'light-content' : 'dark-content'}
        />

        {/* Full Screen Canvas Layer */}
        <CanvasView />

        {/* Floating UI Layers */}
        <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Topbar />

          <View style={styles.floatingContent} pointerEvents="box-none">
            {/* Consolidated tools into the bottom PropertiesPanel as requested */}
            <QuickActions />
            <ZoomControls />
          </View>

          <PropertiesPanel />
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
};

export const CanvasEditor: React.FC<CanvasEditorProps> = (props) => {
  return (
    <SmartCanvasProvider
      darkMode={props.darkMode}
      backgroundColor={props.backgroundColor}
    >
      <EditorLayout {...props} />
    </SmartCanvasProvider>
  );
};

// Alias for compatibility
export const SmartCanvasEditor = CanvasEditor;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  floatingContent: {
    flex: 1,
    position: 'relative',
  },
});
