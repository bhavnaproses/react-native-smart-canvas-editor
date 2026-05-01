import { useState, useCallback, useRef, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Skia, type SkPath } from '@shopify/react-native-skia';
import { useSmartCanvas } from '../Provider';

export const useDrawing = () => {
  const { state, dispatch } = useSmartCanvas();
  const { width, height } = useWindowDimensions();
  const [currentPath, setCurrentPath] = useState<SkPath | null>(null);

  const pathRef = useRef<SkPath | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const smoothedPoint = useRef<{ x: number; y: number } | null>(null);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const getSymmetricPoints = (x: number, y: number) => {
    const points = [{ x, y }];
    const centerX = width / 2;
    const centerY = height / 2;

    if (stateRef.current.symmetry === 'vertical') {
      points.push({ x: 2 * centerX - x, y });
    } else if (stateRef.current.symmetry === 'horizontal') {
      points.push({ x, y: 2 * centerY - y });
    } else if (stateRef.current.symmetry === 'radial') {
      points.push({ x: 2 * centerX - x, y });
      points.push({ x, y: 2 * centerY - y });
      points.push({ x: 2 * centerX - x, y: 2 * centerY - y });
    }
    return points;
  };

  const onStart = useCallback(
    (x: number, y: number) => {
      const s = stateRef.current;
      if (
        s.selectedTool !== 'pen' &&
        s.selectedTool !== 'eraser' &&
        s.selectedTool !== 'brush'
      )
        return;

      const path = Skia.Path.Make();
      const points = getSymmetricPoints(x, y);
      points.forEach((p) => path.moveTo(p.x, p.y));

      pathRef.current = path;
      lastPoint.current = { x, y };
      smoothedPoint.current = { x, y };
      setCurrentPath(path);
    },
    [width, height]
  );

  const onActive = useCallback(
    (x: number, y: number) => {
      const s = stateRef.current;
      const path = pathRef.current;
      if (
        !path ||
        !lastPoint.current ||
        (s.selectedTool !== 'pen' &&
          s.selectedTool !== 'eraser' &&
          s.selectedTool !== 'brush')
      )
        return;

      let targetX = x;
      let targetY = y;

      // Predictive Stroke (Smoothing) - Simple EMA
      if (s.predictiveStroke && smoothedPoint.current) {
        const factor = 0.2; // Smoothing factor
        targetX = smoothedPoint.current.x + (x - smoothedPoint.current.x) * factor;
        targetY = smoothedPoint.current.y + (y - smoothedPoint.current.y) * factor;
        smoothedPoint.current = { x: targetX, y: targetY };
      }

      const currentPoints = getSymmetricPoints(targetX, targetY);
      const prevPoints = getSymmetricPoints(
        lastPoint.current.x,
        lastPoint.current.y
      );

      // In Skia, if we have multiple "sub-paths" in one SkPath object,
      // we need to be careful with lineTo.
      // For symmetry, we actually want separate line segments.
      for (let i = 0; i < currentPoints.length; i++) {
        const p = currentPoints[i]!;
        const prev = prevPoints[i]!;
        // Move to previous point to ensure sub-path continuity
        path.moveTo(prev.x, prev.y);
        path.lineTo(p.x, p.y);
      }

      lastPoint.current = { x: targetX, y: targetY };
      setCurrentPath(path.copy());
    },
    [width, height]
  );

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
    lastPoint.current = null;
    smoothedPoint.current = null;
    setCurrentPath(null);
  }, [dispatch]);

  return {
    currentPath,
    onStart,
    onActive,
    onEnd,
  };
};
