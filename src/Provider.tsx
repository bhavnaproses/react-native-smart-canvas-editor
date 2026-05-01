import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { getTheme, type Theme } from './theme';
import { parseSVGToElements } from './utils/svgParser';

interface Element {
  id: string;
  type:
    | 'path'
    | 'rect'
    | 'circle'
    | 'eraser'
    | 'brush'
    | 'text'
    | 'image'
    | 'sticker';
  path?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  strokeWidth: number;
  opacity: number;
  blur?: number;
  roughness?: number;
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  // Image/Sticker specific
  uri?: string;
  assetId?: string;
}

export interface Layer {
  id: string;
  name: string;
  elements: Element[];
  visible: boolean;
  locked: boolean;
  opacity: number;
  // blendMode: string; // We'll use string for now or Skia BlendMode
}

interface State {
  selectedTool: string;
  layers: Layer[];
  activeLayerId: string;
  selectedElementId: string | null;
  isDarkMode: boolean;
  showProperties: boolean;
  past: Layer[][]; // Past states of layers
  future: Layer[][];
  canvasBackground: string;
  activeColor: string;
  activeStrokeWidth: number;
  activeOpacity: number;
  activeBlur: number;
  activeRoughness: number;
  activeText: string;
  activeFontSize: number;
  activeFontFamily: string;
  showGrid: boolean;
  gridSize: number;
  // Sketchbook specific
  symmetry: 'none' | 'vertical' | 'horizontal' | 'radial';
  predictiveStroke: boolean;
  showUI: boolean;
  showSidebar: boolean;
}

type Action =
  | { type: 'SET_TOOL'; tool: string }
  | { type: 'ADD_ELEMENT'; element: Element; select?: boolean }
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'UPDATE_ELEMENT'; id: string; updates: Partial<Element> }
  | { type: 'MOVE_ELEMENT'; id: string; x: number; y: number }
  | {
      type: 'FINISH_MOVE';
      id: string;
      x: number;
      y: number;
      originalX: number;
      originalY: number;
    }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_DARK_MODE'; isDarkMode: boolean }
  | { type: 'SET_SHOW_PROPERTIES'; show: boolean }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_CANVAS_BACKGROUND'; color: string }
  | { type: 'MOVE_TO_FRONT'; id: string }
  | { type: 'MOVE_TO_BACK'; id: string }
  | { type: 'SET_GRID'; show: boolean; size?: number }
  | { type: 'TOGGLE_UI' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SYMMETRY'; symmetry: State['symmetry'] }
  | { type: 'TOGGLE_PREDICTIVE_STROKE' }
  // Layer actions
  | { type: 'ADD_LAYER' }
  | { type: 'DELETE_LAYER'; id: string }
  | { type: 'SET_ACTIVE_LAYER'; id: string }
  | { type: 'UPDATE_LAYER'; id: string; updates: Partial<Layer> }
  | { type: 'REORDER_LAYERS'; layers: Layer[] }
  | {
      type: 'SET_ACTIVE_PROPERTY';
      updates: Partial<{
        activeColor: string;
        activeStrokeWidth: number;
        activeOpacity: number;
        activeBlur: number;
        activeRoughness: number;
        activeText: string;
        activeFontSize: number;
        activeFontFamily: string;
      }>;
    };

const defaultLayer: Layer = {
  id: 'layer-1',
  name: 'Layer 1',
  elements: [],
  visible: true,
  locked: false,
  opacity: 1,
};

const initialState: State = {
  selectedTool: 'pen',
  layers: [defaultLayer],
  activeLayerId: 'layer-1',
  selectedElementId: null,
  isDarkMode: true,
  showProperties: false,
  past: [],
  future: [],
  canvasBackground: '#FFFFFF',
  activeColor: '#6366F1',
  activeStrokeWidth: 4,
  activeOpacity: 1,
  activeBlur: 3,
  activeRoughness: 0,
  activeText: 'New Text',
  activeFontSize: 24,
  activeFontFamily: 'system-ui',
  showGrid: false,
  gridSize: 20,
  symmetry: 'none',
  predictiveStroke: true,
  showUI: true,
  showSidebar: false,
};

const SmartCanvasContext = createContext<
  | {
      state: State;
      dispatch: React.Dispatch<Action>;
      theme: Theme;
      onSave?: (data: { elements: Element[]; svg: string }) => void;
    }
  | undefined
>(undefined);

const canvasReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, selectedTool: action.tool };

    case 'ADD_ELEMENT': {
      const newLayers = state.layers.map((layer) =>
        layer.id === state.activeLayerId
          ? { ...layer, elements: [...layer.elements, action.element] }
          : layer
      );
      return {
        ...state,
        past: [...state.past, state.layers],
        layers: newLayers,
        future: [],
        selectedElementId: action.select
          ? action.element.id
          : state.selectedElementId,
      };
    }

    case 'SELECT_ELEMENT':
      return {
        ...state,
        selectedElementId: action.id,
      };

    case 'UPDATE_ELEMENT': {
      const newLayers = state.layers.map((layer) => ({
        ...layer,
        elements: layer.elements.map((el) =>
          el.id === action.id ? { ...el, ...action.updates } : el
        ),
      }));
      return {
        ...state,
        past: [...state.past, state.layers],
        layers: newLayers,
        future: [],
      };
    }

    case 'MOVE_ELEMENT': {
      const newLayers = state.layers.map((layer) => ({
        ...layer,
        elements: layer.elements.map((el) =>
          el.id === action.id ? { ...el, x: action.x, y: action.y } : el
        ),
      }));
      return {
        ...state,
        layers: newLayers,
      };
    }

    case 'FINISH_MOVE': {
      const preDragSnapshot = state.layers.map((layer) => ({
        ...layer,
        elements: layer.elements.map((el) =>
          el.id === action.id
            ? { ...el, x: action.originalX, y: action.originalY }
            : el
        ),
      }));
      const newLayers = state.layers.map((layer) => ({
        ...layer,
        elements: layer.elements.map((el) =>
          el.id === action.id ? { ...el, x: action.x, y: action.y } : el
        ),
      }));
      return {
        ...state,
        past: [...state.past, preDragSnapshot],
        layers: newLayers,
        future: [],
      };
    }

    case 'UNDO':
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      return {
        ...state,
        past: state.past.slice(0, -1),
        layers: previous,
        future: [state.layers, ...state.future],
        selectedElementId: null,
      };

    case 'REDO':
      if (state.future.length === 0) return state;
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        past: [...state.past, state.layers],
        layers: next,
        future: state.future.slice(1),
        selectedElementId: null,
      };

    case 'MOVE_TO_FRONT': {
      const newLayers = state.layers.map((layer) => {
        const element = layer.elements.find((el) => el.id === action.id);
        if (!element) return layer;
        return {
          ...layer,
          elements: [
            ...layer.elements.filter((el) => el.id !== action.id),
            element,
          ],
        };
      });
      return {
        ...state,
        past: [...state.past, state.layers],
        layers: newLayers,
        future: [],
      };
    }

    case 'MOVE_TO_BACK': {
      const newLayers = state.layers.map((layer) => {
        const element = layer.elements.find((el) => el.id === action.id);
        if (!element) return layer;
        return {
          ...layer,
          elements: [
            element,
            ...layer.elements.filter((el) => el.id !== action.id),
          ],
        };
      });
      return {
        ...state,
        past: [...state.past, state.layers],
        layers: newLayers,
        future: [],
      };
    }

    case 'SET_GRID':
      return {
        ...state,
        showGrid: action.show,
        gridSize: action.size ?? state.gridSize,
      };

    case 'TOGGLE_DARK_MODE':
      return { ...state, isDarkMode: !state.isDarkMode };

    case 'SET_DARK_MODE':
      return { ...state, isDarkMode: action.isDarkMode };

    case 'SET_SHOW_PROPERTIES':
      return { ...state, showProperties: action.show };

    case 'SET_CANVAS_BACKGROUND':
      return { ...state, canvasBackground: action.color };

    case 'SET_ACTIVE_PROPERTY':
      return { ...state, ...action.updates };

    case 'TOGGLE_UI':
      return { ...state, showUI: !state.showUI };

    case 'TOGGLE_SIDEBAR':
      return { ...state, showSidebar: !state.showSidebar };

    case 'SET_SYMMETRY':
      return { ...state, symmetry: action.symmetry };

    case 'TOGGLE_PREDICTIVE_STROKE':
      return { ...state, predictiveStroke: !state.predictiveStroke };

    case 'ADD_LAYER': {
      const newLayer: Layer = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Layer ${state.layers.length + 1}`,
        elements: [],
        visible: true,
        locked: false,
        opacity: 1,
      };
      return {
        ...state,
        past: [...state.past, state.layers],
        layers: [newLayer, ...state.layers], // Add to top
        activeLayerId: newLayer.id,
        future: [],
      };
    }

    case 'DELETE_LAYER':
      if (state.layers.length <= 1) return state;
      const remainingLayers = state.layers.filter((l) => l.id !== action.id);
      return {
        ...state,
        past: [...state.past, state.layers],
        layers: remainingLayers,
        activeLayerId:
          state.activeLayerId === action.id
            ? remainingLayers[0]!.id
            : state.activeLayerId,
        future: [],
      };

    case 'SET_ACTIVE_LAYER':
      return { ...state, activeLayerId: action.id };

    case 'UPDATE_LAYER':
      return {
        ...state,
        past: [...state.past, state.layers],
        layers: state.layers.map((l) =>
          l.id === action.id ? { ...l, ...action.updates } : l
        ),
        future: [],
      };

    case 'REORDER_LAYERS':
      return {
        ...state,
        past: [...state.past, state.layers],
        layers: action.layers,
        future: [],
      };

    default:
      return state;
  }
};

export const SmartCanvasProvider: React.FC<{
  children: React.ReactNode;
  darkMode?: boolean;
  backgroundColor?: string;
  initialElements?: Element[];
  initialSvg?: string;
  onSave?: (data: { elements: Element[]; svg: string }) => void;
}> = ({
  children,
  darkMode,
  backgroundColor,
  initialElements,
  initialSvg,
  onSave,
}) => {
  const [state, dispatch] = useReducer(canvasReducer, {
    ...initialState,
    isDarkMode: darkMode !== undefined ? darkMode : initialState.isDarkMode,
    canvasBackground: backgroundColor || initialState.canvasBackground,
    layers: [
      {
        ...initialState.layers[0]!,
        elements: initialSvg
          ? parseSVGToElements(initialSvg)
          : initialElements || [],
      },
    ],
  });

  React.useEffect(() => {
    if (darkMode !== undefined) {
      dispatch({ type: 'SET_DARK_MODE', isDarkMode: darkMode });
    }
  }, [darkMode]);

  const theme = useMemo(() => getTheme(state.isDarkMode), [state.isDarkMode]);

  return (
    <SmartCanvasContext.Provider value={{ state, dispatch, theme, onSave }}>
      {children}
    </SmartCanvasContext.Provider>
  );
};

export const useSmartCanvas = () => {
  const context = useContext(SmartCanvasContext);
  if (!context) {
    throw new Error('useSmartCanvas must be used within a SmartCanvasProvider');
  }
  return context;
};
