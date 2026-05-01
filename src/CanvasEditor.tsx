import React from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CanvasView } from './components/CanvasView';
import { Topbar } from './components/Topbar';
import { SmartCanvasProvider, useSmartCanvas } from './Provider';
import type { CanvasEditorProps } from './types';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Sidebar } from './components/Sidebar';
import { RadialMenu } from './components/RadialMenu';

const EditorLayout: React.FC<CanvasEditorProps> = (_props) => {
  const { state, theme, dispatch } = useSmartCanvas();

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
          {state.showUI ? (
            <>
              <Topbar />
              <Sidebar />
              <RadialMenu />
            </>
          ) : (
            <TouchableOpacity
              style={styles.showUIButton}
              onPress={() => dispatch({ type: 'TOGGLE_UI' })}
            >
              <Text style={{ fontSize: 20 }}>👁️</Text>
            </TouchableOpacity>
          )}
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
      initialElements={props.initialElements}
      initialSvg={props.initialSvg}
      onSave={props.onSave}
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
  showUIButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
