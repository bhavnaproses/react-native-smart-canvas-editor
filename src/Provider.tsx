import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { getTheme, type Theme } from './theme';

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

interface State {
  selectedTool: string;
  elements: Element[];
  selectedElementId: string | null;
  isDarkMode: boolean;
  showProperties: boolean;
  past: Element[][];
  future: Element[][];
  canvasBackground: string;
  activeColor: string;
  activeStrokeWidth: number;
  activeOpacity: number;
  activeBlur: number;
  activeRoughness: number;
  showGrid: boolean;
  gridSize: number;
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
  | {
      type: 'SET_ACTIVE_PROPERTY';
      updates: Partial<{
        activeColor: string;
        activeStrokeWidth: number;
        activeOpacity: number;
        activeBlur: number;
        activeRoughness: number;
      }>;
    };

const initialState: State = {
  selectedTool: 'pen',
  elements: [],
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
  showGrid: false,
  gridSize: 20,
};

const SmartCanvasContext = createContext<
  | {
      state: State;
      dispatch: React.Dispatch<Action>;
      theme: Theme;
    }
  | undefined
>(undefined);

const canvasReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, selectedTool: action.tool };

    case 'ADD_ELEMENT':
      return {
        ...state,
        past: [...state.past, state.elements],
        elements: [...state.elements, action.element],
        future: [],
        selectedElementId: action.select
          ? action.element.id
          : state.selectedElementId,
      };

    case 'SELECT_ELEMENT':
      return {
        ...state,
        selectedElementId: action.id,
      };

    case 'UPDATE_ELEMENT':
      const newElements = state.elements.map((el) =>
        el.id === action.id ? { ...el, ...action.updates } : el
      );
      return {
        ...state,
        past: [...state.past, state.elements],
        elements: newElements,
        future: [],
      };

    case 'MOVE_ELEMENT':
      // Lightweight move - NO undo history push (called every frame during drag)
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.id ? { ...el, x: action.x, y: action.y } : el
        ),
      };

    case 'FINISH_MOVE': {
      // Build the pre-drag snapshot using originalX/originalY so undo reverts to before the drag
      const preDragSnapshot = state.elements.map((el) =>
        el.id === action.id
          ? { ...el, x: action.originalX, y: action.originalY }
          : el
      );
      return {
        ...state,
        past: [...state.past, preDragSnapshot],
        elements: state.elements.map((el) =>
          el.id === action.id ? { ...el, x: action.x, y: action.y } : el
        ),
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
        elements: previous,
        future: [state.elements, ...state.future],
        selectedElementId: null,
      };

    case 'REDO':
      if (state.future.length === 0) return state;
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        past: [...state.past, state.elements],
        elements: next,
        future: state.future.slice(1),
        selectedElementId: null,
      };

    case 'MOVE_TO_FRONT':
      const elementToFront = state.elements.find((el) => el.id === action.id);
      if (!elementToFront) return state;
      return {
        ...state,
        past: [...state.past, state.elements],
        elements: [
          ...state.elements.filter((el) => el.id !== action.id),
          elementToFront,
        ],
        future: [],
      };

    case 'MOVE_TO_BACK':
      const elementToBack = state.elements.find((el) => el.id === action.id);
      if (!elementToBack) return state;
      return {
        ...state,
        past: [...state.past, state.elements],
        elements: [
          elementToBack,
          ...state.elements.filter((el) => el.id !== action.id),
        ],
        future: [],
      };

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

    default:
      return state;
  }
};

export const SmartCanvasProvider: React.FC<{
  children: React.ReactNode;
  darkMode?: boolean;
  backgroundColor?: string;
}> = ({ children, darkMode, backgroundColor }) => {
  const [state, dispatch] = useReducer(canvasReducer, {
    ...initialState,
    isDarkMode: darkMode !== undefined ? darkMode : initialState.isDarkMode,
    canvasBackground: backgroundColor || initialState.canvasBackground,
  });

  React.useEffect(() => {
    if (darkMode !== undefined) {
      dispatch({ type: 'SET_DARK_MODE', isDarkMode: darkMode });
    }
  }, [darkMode]);

  const theme = useMemo(() => getTheme(state.isDarkMode), [state.isDarkMode]);

  return (
    <SmartCanvasContext.Provider value={{ state, dispatch, theme }}>
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
