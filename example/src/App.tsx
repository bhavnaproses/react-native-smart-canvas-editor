import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CanvasEditor } from 'react-native-smart-canvas-editor';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {/* Controlled entirely via props now */}
        <CanvasEditor darkMode={false} backgroundColor="#c" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
