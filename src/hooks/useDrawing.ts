import { useState, useCallback, useRef, useEffect } from 'react';
import { Skia, type SkPath } from '@shopify/react-native-skia';
import { useSmartCanvas } from '../Provider';

export const useDrawing = () => {
  const { state, dispatch } = useSmartCanvas();
  const [currentPath, setCurrentPath] = useState<SkPath | null>(null);

  // Use a ref for the path to keep callback identities stable
  const pathRef = useRef<SkPath | null>(null);

  // Keep state in ref for stable callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const onStart = useCallback((x: number, y: number) => {
    const s = stateRef.current;
    if (
      s.selectedTool !== 'pen' &&
      s.selectedTool !== 'eraser' &&
      s.selectedTool !== 'brush'
    )
      return;

    const path = Skia.Path.Make();
    path.moveTo(x, y);
    pathRef.current = path;
    setCurrentPath(path);
  }, []);

  const onActive = useCallback((x: number, y: number) => {
    const s = stateRef.current;
    const path = pathRef.current;
    if (
      !path ||
      (s.selectedTool !== 'pen' &&
        s.selectedTool !== 'eraser' &&
        s.selectedTool !== 'brush')
    )
      return;

    path.lineTo(x, y);

    // We need to trigger a re-render. Since Skia paths are mutable,
    // we can just create a shallow copy or a new state reference.
    // .copy() is efficient in Skia.
    setCurrentPath(path.copy());
  }, []);

  const onEnd = useCallback(() => {
    const s = stateRef.current;
    const path = pathRef.current;
    if (!path) return;

    const isEraser = s.selectedTool === 'eraser';

    dispatch({
      type: 'ADD_ELEMENT',
      element: {
        id: Math.random().toString(36).substr(2, 9),
        type: isEraser ? 'eraser' : s.selectedTool === 'pen' ? 'path' : 'brush',
        path: path.toSVGString(),
        color: isEraser ? '#000000' : s.activeColor,
        strokeWidth: isEraser ? s.activeStrokeWidth * 5 : s.activeStrokeWidth,
        opacity: isEraser ? 1 : s.activeOpacity,
        blur: s.selectedTool === 'brush' ? s.activeBlur : undefined,
        roughness: s.selectedTool === 'pen' ? s.activeRoughness : undefined,
      },
      select: false,
    });

    pathRef.current = null;
    setCurrentPath(null);
  }, [dispatch]);

  return {
    currentPath,
    onStart,
    onActive,
    onEnd,
  };
};
