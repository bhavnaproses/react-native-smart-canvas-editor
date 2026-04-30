import type { ViewStyle } from 'react-native';

export interface CanvasEditorProps {
  style?: ViewStyle;
  initialElements?: any[];
  onSave?: (elements: any[]) => void;
  darkMode?: boolean;
  backgroundColor?: string;
}
