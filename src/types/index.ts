import type { ViewStyle } from 'react-native';

export interface CanvasEditorProps {
  style?: ViewStyle;
  initialElements?: any[];
  initialSvg?: string;
  onSave?: (data: { elements: any[]; svg: string }) => void;
  darkMode?: boolean;
  backgroundColor?: string;
}
