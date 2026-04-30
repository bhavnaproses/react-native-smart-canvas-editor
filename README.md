# react-native-smart-canvas-editor

A professional-grade, high-performance Smart Canvas Editor for React Native. Built with **Shopify Skia**, **Reanimated**, and **Gesture Handler**, it provides a fluid and intuitive drawing experience with advanced manipulation capabilities.

## 🚀 Features

- **🎨 Professional Drawing Tools**
  - **Pen**: Standard smooth path drawing.
  - **Pencil**: Realistic grainy graphite texture.
  - **Brush**: Soft-edged strokes with adjustable blur.
  - **Eraser**: High-performance path erasing.

- **📐 Vector Shapes**
  - Create and manipulate **Rectangles** and **Circles**.
  - Dynamic resizing and positioning.

- **🖱️ Advanced Interactions**
  - **Selection**: Long press to select elements.
  - **Drag & Drop**: Smooth, UI-thread driven movement of single elements.
  - **Layer Management**: Bring to Front and Send to Back controls.

- **🛠️ Property Control**
  - Fine-tune **Color**, **Stroke Width**, **Opacity**, **Blur**, and **Roughness**.
  - Context-aware properties panel.

- **⏱️ Productivity**
  - **Undo/Redo**: Full history support for all actions.
  - **Grid System**: Toggleable grid for precise alignment.
  - **Zoom & Pan**: Smooth navigation across the canvas.

- **🌓 Themes & Customization**
  - Native **Dark Mode** and **Light Mode** support.
  - Customizable canvas background.

## 📦 Installation

```sh
npm install react-native-smart-canvas-editor
```

### Peer Dependencies

This library requires the following peer dependencies to be installed in your project:

```sh
npm install @shopify/react-native-skia react-native-reanimated react-native-gesture-handler react-native-svg react-native-safe-area-context
```

> [!IMPORTANT]
> Make sure to follow the installation guides for [React Native Skia](https://shopify.github.io/react-native-skia/docs/getting-started/installation) and [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) as they require additional setup.

## 📖 Usage

### Basic Usage

```tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CanvasEditor } from 'react-native-smart-canvas-editor';

export default function App() {
  return (
    <SafeAreaProvider>
      <CanvasEditor 
        darkMode={true}
        backgroundColor="#1A1A1A"
      />
    </SafeAreaProvider>
  );
}
```

### Advanced Usage

```tsx
import React from 'react';
import { CanvasEditor } from 'react-native-smart-canvas-editor';

const MyEditor = () => {
  const handleSave = (elements) => {
    console.log('Saved elements:', elements);
  };

  return (
    <CanvasEditor
      darkMode={false}
      backgroundColor="#FFFFFF"
      onSave={handleSave}
      initialElements={[]}
    />
  );
};
```

## ⚙️ Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `darkMode` | `boolean` | `true` | Toggles between light and dark UI themes. |
| `backgroundColor` | `string` | `#FFFFFF` | The background color of the canvas area. |
| `initialElements` | `Element[]` | `[]` | Initial state of elements to load into the editor. |
| `onSave` | `(elements: Element[]) => void` | `undefined` | Callback fired when the save action is triggered. |
| `style` | `ViewStyle` | `undefined` | Custom styles for the editor container. |

## 🛠️ Tools & Interactions

- **Select Tool**: Click an element to select it. Drag to move.
- **Lasso Tool**: Draw a path around elements to group-select them.
- **Pen/Pencil/Brush**: Start drawing directly on the canvas.
- **Long Press**: Toggle selection state of an element without deselecting others.
- **Undo (↶) / Redo (↷)**: Use the top bar buttons to navigate history.

## 📄 License

MIT

---

Made with ❤️ by [bhavna.proses](https://github.com/bhavnaproses)
