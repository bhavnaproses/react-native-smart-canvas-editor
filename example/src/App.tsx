import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CanvasEditor } from 'react-native-smart-canvas-editor';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {/* Controlled entirely via props now */}
        <CanvasEditor
          darkMode={false}
          backgroundColor="#FFFFFF"
          initialSvg={`
            <svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
              <rect x="100" y="100" width="200" height="100" fill="#FF5733" opacity="0.8" />
              <circle cx="400" cy="200" r="50" fill="#33FF57" />
              <path d="M 500 500 L 600 600 L 700 500 Z" stroke="#3357FF" stroke-width="5" fill="none" />
              <text x="100" y="400" fill="#000000" font-size="40" font-family="Arial">Hello SVG!</text>
            </svg>
          `}
          onSave={({ elements, svg }) => {
            console.log('Saved elements:', elements);
            console.log('Generated SVG:', svg);
            // alert is not available in some environments without window/global
            console.log(`Saved ${elements.length} elements to SVG! (SVG Length: ${svg.length})`);
          }}
        />
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
