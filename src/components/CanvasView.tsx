import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  Canvas,
  Path,
  Rect,
  Group,
  Skia,
  Circle,
  BlurMask,
  DiscretePathEffect,
  Text as SkiaText,
} from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import {
  useDerivedValue,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { useSmartCanvas } from '../Provider';
import { useDrawing } from '../hooks/useDrawing';

const SELECTION_COLOR = '#00A3FF';

const RenderElement = React.memo(
  ({ el, dragOffset, activeDragIdSV, elementStartPos }: any) => {
    const transform = useDerivedValue(() => {
      if (activeDragIdSV.value === el.id) {
        return [
          { translateX: elementStartPos.value.x + dragOffset.value.x },
          { translateY: elementStartPos.value.y + dragOffset.value.y },
        ];
      }
      return [{ translateX: el.x || 0 }, { translateY: el.y || 0 }];
    }, [el.x, el.y, el.id]);

    const rectX = useDerivedValue(
      () =>
        activeDragIdSV.value === el.id
          ? elementStartPos.value.x + dragOffset.value.x
          : el.x || 0,
      [el.x, el.id]
    );
    const rectY = useDerivedValue(
      () =>
        activeDragIdSV.value === el.id
          ? elementStartPos.value.y + dragOffset.value.y
          : el.y || 0,
      [el.y, el.id]
    );

    const font = useMemo(() => {
      if (el.type !== 'text') return null;
      try {
        // Use undefined for the default typeface, which is compatible with SkTypeface | undefined
        return Skia.Font(undefined, el.fontSize || 20);
      } catch (e) {
        console.error('Font creation failed', e);
        return null;
      }
    }, [el.type, el.fontSize]);

    if (el.opacity === 0) return null;

    if (el.type === 'path') {
      return (
        <Group transform={transform}>
          <Path
            path={el.path!}
            color={el.color}
            style="stroke"
            strokeWidth={el.strokeWidth}
            strokeCap="round"
            strokeJoin="round"
            opacity={el.opacity}
          >
            {!!(el.roughness && el.roughness > 0) && (
              <DiscretePathEffect length={2} deviation={el.roughness} />
            )}
          </Path>
        </Group>
      );
    } else if (el.type === 'eraser') {
      return (
        <Group transform={transform}>
          <Path
            path={el.path!}
            style="stroke"
            strokeWidth={el.strokeWidth}
            strokeCap="round"
            strokeJoin="round"
            blendMode="clear"
          />
        </Group>
      );
    } else if (el.type === 'brush') {
      return (
        <Group transform={transform}>
          <Path
            path={el.path!}
            color={el.color}
            style="stroke"
            strokeWidth={el.strokeWidth}
            strokeCap="round"
            strokeJoin="round"
            opacity={el.opacity}
          >
            <BlurMask blur={el.blur || 0} style="normal" />
          </Path>
        </Group>
      );
    } else if (el.type === 'rect') {
      return (
        <Rect
          x={rectX}
          y={rectY}
          width={el.width!}
          height={el.height!}
          color={el.color}
          opacity={el.opacity}
        />
      );
    } else if (el.type === 'circle') {
      return (
        <Circle
          cx={rectX}
          cy={rectY}
          r={el.radius || 50}
          color={el.color}
          opacity={el.opacity}
        />
      );
    } else if (el.type === 'image' || el.type === 'sticker') {
      return (
        <Rect
          x={rectX}
          y={rectY}
          width={el.width || 100}
          height={el.height || 100}
          color={el.color}
          opacity={el.opacity}
        >
          <BlurMask blur={2} style="inner" />
        </Rect>
      );
    } else if (el.type === 'text') {
      return (
        <Group transform={transform}>
          <SkiaText
            x={0}
            y={el.fontSize || 20}
            text={el.text || 'Text'}
            color={el.color}
            opacity={el.opacity}
            font={font}
          />
        </Group>
      );
    }
    return null;
  }
);

export const CanvasView: React.FC = () => {
  const { state, dispatch, theme } = useSmartCanvas();
  const { currentPath, onStart, onActive, onEnd } = useDrawing();

  const dragStart = useSharedValue({ x: 0, y: 0 });
  const elementStartPos = useSharedValue({ x: 0, y: 0 });
  const dragOffset = useSharedValue({ x: 0, y: 0 });
  const activeDragIdSV = useSharedValue<string | null>(null);
  const isDraggingSV = useSharedValue(false);
  const tapCandidateIdSV = useSharedValue<string | null>(null);

  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
    if (activeDragIdSV.value) {
      dragOffset.value = { x: 0, y: 0 };
      activeDragIdSV.value = null;
    }
  }, [state, activeDragIdSV, dragOffset]);

  // Sync state to shared values for UI thread access
  const selectedToolSV = useSharedValue(state.selectedTool);
  React.useEffect(() => {
    selectedToolSV.value = state.selectedTool;
  }, [state.selectedTool, selectedToolSV]);

  const elementMetadata = useMemo(() => {
    const allElements: any[] = [];
    state.layers.forEach((layer) => {
      if (!layer.visible) return;
      layer.elements.forEach((el) => {
        let bounds = { x: 0, y: 0, width: 0, height: 0 };
        if (el.type === 'path' || el.type === 'eraser' || el.type === 'brush') {
          const path = Skia.Path.MakeFromSVGString(el.path!);
          bounds = path ? path.getBounds() : bounds;
        } else if (el.type === 'text') {
          bounds = {
            x: 0,
            y: 0,
            width: (el.text?.length || 0) * (el.fontSize || 20) * 0.6,
            height: el.fontSize || 20,
          };
        } else {
          bounds = {
            x: 0,
            y: 0,
            width: el.width || 0,
            height: el.height || 0,
          };
        }
        allElements.push({
          id: el.id,
          type: el.type,
          x: el.x || 0,
          y: el.y || 0,
          opacity: el.opacity * layer.opacity,
          bounds,
        });
      });
    });
    return allElements;
  }, [state.layers]);

  const elementMetadataSV = useSharedValue(elementMetadata);
  React.useEffect(() => {
    elementMetadataSV.value = elementMetadata;
  }, [elementMetadata, elementMetadataSV]);

  const selectionTransform = useDerivedValue(() => {
    if (
      activeDragIdSV.value &&
      activeDragIdSV.value === state.selectedElementId
    ) {
      const elements = elementMetadataSV.value;
      const el = elements.find((e) => e.id === activeDragIdSV.value);
      if (el) {
        return [
          { translateX: elementStartPos.value.x + dragOffset.value.x - el.x },
          { translateY: elementStartPos.value.y + dragOffset.value.y - el.y },
        ];
      }
    }
    return [{ translateX: 0 }, { translateY: 0 }];
  }, [state.selectedElementId]);

  const findElementAtUI = React.useCallback(
    (x: number, y: number) => {
      'worklet';
      const elements = elementMetadataSV.value;
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (!el || el.opacity === 0) continue;

        const bounds = el.bounds;
        const ox = el.x;
        const oy = el.y;
        const padding = 20;

        if (el.type === 'rect') {
          if (
            x >= ox &&
            x <= ox + bounds.width &&
            y >= oy &&
            y <= oy + bounds.height
          ) {
            return el.id;
          }
        } else {
          if (
            x >= bounds.x + ox - padding &&
            x <= bounds.x + bounds.width + ox + padding &&
            y >= bounds.y + oy - padding &&
            y <= bounds.y + bounds.height + oy + padding
          ) {
            return el.id;
          }
        }
      }
      return null;
    },
    [elementMetadataSV]
  );

  const gesture = useMemo(() => {
    return Gesture.Pan()
      .minDistance(0)
      .onBegin((e) => {
        'worklet';
        isDraggingSV.value = false;
        activeDragIdSV.value = null;

        if (selectedToolSV.value === 'select') {
          const id = findElementAtUI(e.x, e.y);
          if (id) {
            const elements = elementMetadataSV.value;
            const el = elements.find((item) => item.id === id);
            if (el) {
              activeDragIdSV.value = id;
              dragStart.value = { x: e.x, y: e.y };
              elementStartPos.value = { x: el.x, y: el.y };
            }
          }
          tapCandidateIdSV.value = id;
        } else if (
          selectedToolSV.value === 'pen' ||
          selectedToolSV.value === 'eraser' ||
          selectedToolSV.value === 'brush'
        ) {
          runOnJS(onStart)(e.x, e.y);
        }
      })
      .onUpdate((e) => {
        'worklet';
        if (selectedToolSV.value === 'select' && activeDragIdSV.value) {
          const dx = e.x - dragStart.value.x;
          const dy = e.y - dragStart.value.y;

          if (!isDraggingSV.value && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
            isDraggingSV.value = true;
          }

          if (isDraggingSV.value) {
            dragOffset.value = { x: dx, y: dy };
          }
        } else if (
          selectedToolSV.value === 'pen' ||
          selectedToolSV.value === 'eraser' ||
          selectedToolSV.value === 'brush'
        ) {
          runOnJS(onActive)(e.x, e.y);
        }
      })
      .onEnd((e) => {
        'worklet';
        if (selectedToolSV.value === 'select') {
          if (isDraggingSV.value && activeDragIdSV.value) {
            const dx = dragOffset.value.x;
            const dy = dragOffset.value.y;
            runOnJS(dispatch)({
              type: 'FINISH_MOVE',
              id: activeDragIdSV.value,
              x: elementStartPos.value.x + dx,
              y: elementStartPos.value.y + dy,
              originalX: elementStartPos.value.x,
              originalY: elementStartPos.value.y,
            });
          } else {
            runOnJS(dispatch)({
              type: 'SELECT_ELEMENT',
              id: tapCandidateIdSV.value,
            });
          }
        } else if (selectedToolSV.value === 'shape') {
          runOnJS(dispatch)({
            type: 'ADD_ELEMENT',
            element: {
              id: Math.random().toString(36).substr(2, 9),
              type: 'rect',
              x: e.x - 50,
              y: e.y - 50,
              width: 100,
              height: 100,
              color: stateRef.current.activeColor,
              strokeWidth: stateRef.current.activeStrokeWidth,
              opacity: stateRef.current.activeOpacity,
            },
            select: true,
          });
        } else if (selectedToolSV.value === 'text') {
          runOnJS(dispatch)({
            type: 'ADD_ELEMENT',
            element: {
              id: Math.random().toString(36).substr(2, 9),
              type: 'text',
              text: stateRef.current.activeText,
              x: e.x,
              y: e.y,
              fontSize: stateRef.current.activeFontSize,
              color: stateRef.current.activeColor,
              strokeWidth: 2,
              opacity: 1,
            },
            select: true,
          });
        } else if (
          selectedToolSV.value === 'image' ||
          selectedToolSV.value === 'stickers'
        ) {
          runOnJS(dispatch)({
            type: 'ADD_ELEMENT',
            element: {
              id: Math.random().toString(36).substr(2, 9),
              type: selectedToolSV.value === 'image' ? 'image' : 'sticker',
              x: e.x - 50,
              y: e.y - 50,
              width: 100,
              height: 100,
              color: stateRef.current.activeColor,
              strokeWidth: 0,
              opacity: 1,
            },
            select: true,
          });
        } else if (
          selectedToolSV.value === 'pen' ||
          selectedToolSV.value === 'eraser' ||
          selectedToolSV.value === 'brush'
        ) {
          runOnJS(onEnd)();
        }
        isDraggingSV.value = false;
      });
  }, [
    onStart,
    onActive,
    onEnd,
    dispatch,
    selectedToolSV,
    activeDragIdSV,
    dragStart,
    elementStartPos,
    tapCandidateIdSV,
    isDraggingSV,
    dragOffset,
    elementMetadataSV,
    findElementAtUI,
  ]);

  const renderedLayers = useMemo(() => {
    // Reverse layers for rendering (bottom to top)
    return [...state.layers].reverse().map((layer) => {
      if (!layer.visible) return null;
      return (
        <Group key={layer.id} opacity={layer.opacity}>
          {layer.elements.map((el) => (
            <RenderElement
              key={el.id}
              el={el}
              dragOffset={dragOffset}
              activeDragIdSV={activeDragIdSV}
              elementStartPos={elementStartPos}
            />
          ))}
        </Group>
      );
    });
  }, [state.layers, dragOffset, activeDragIdSV, elementStartPos]);

  const selectionOverlay = useMemo(() => {
    if (!state.selectedElementId) return null;
    let selectedEl: any = null;
    state.layers.forEach((l) => {
      const found = l.elements.find((e) => e.id === state.selectedElementId);
      if (found) selectedEl = found;
    });

    if (!selectedEl || selectedEl.opacity === 0) return null;

    let bounds = { x: 0, y: 0, width: 0, height: 0 };
    const el = selectedEl;
    if (el.type === 'rect' || el.type === 'image' || el.type === 'sticker') {
      bounds = {
        x: el.x!,
        y: el.y!,
        width: el.width || 100,
        height: el.height || 100,
      };
    } else if (el.type === 'circle') {
      bounds = {
        x: el.x! - (el.radius || 50),
        y: el.y! - (el.radius || 50),
        width: (el.radius || 50) * 2,
        height: (el.radius || 50) * 2,
      };
    } else if (el.type === 'text') {
      const w = (el.text?.length || 0) * (el.fontSize || 20) * 0.6;
      const h = el.fontSize || 20;
      bounds = { x: el.x!, y: el.y!, width: w, height: h };
    } else {
      const skPath = Skia.Path.MakeFromSVGString(el.path!);
      if (skPath) {
        const skBounds = skPath.getBounds();
        bounds = {
          x: skBounds.x + (el.x || 0),
          y: skBounds.y + (el.y || 0),
          width: skBounds.width,
          height: skBounds.height,
        };
      }
    }

    const pad = 4;
    return (
      <Group transform={selectionTransform}>
        <Rect
          x={bounds.x - pad}
          y={bounds.y - pad}
          width={bounds.width + pad * 2}
          height={bounds.height + pad * 2}
          color={SELECTION_COLOR}
          style="stroke"
          strokeWidth={2}
        />
        <Circle cx={bounds.x - pad} cy={bounds.y - pad} r={5} color="#FFF" />
        <Circle
          cx={bounds.x - pad}
          cy={bounds.y - pad}
          r={5}
          color={SELECTION_COLOR}
          style="stroke"
          strokeWidth={1.5}
        />
        <Circle
          cx={bounds.x + bounds.width + pad}
          cy={bounds.y - pad}
          r={5}
          color="#FFF"
        />
        <Circle
          cx={bounds.x + bounds.width + pad}
          cy={bounds.y - pad}
          r={5}
          color={SELECTION_COLOR}
          style="stroke"
          strokeWidth={1.5}
        />
        <Circle
          cx={bounds.x - pad}
          cy={bounds.y + bounds.height + pad}
          r={5}
          color="#FFF"
        />
        <Circle
          cx={bounds.x - pad}
          cy={bounds.y + bounds.height + pad}
          r={5}
          color={SELECTION_COLOR}
          style="stroke"
          strokeWidth={1.5}
        />
        <Circle
          cx={bounds.x + bounds.width + pad}
          cy={bounds.y + bounds.height + pad}
          r={5}
          color="#FFF"
        />
        <Circle
          cx={bounds.x + bounds.width + pad}
          cy={bounds.y + bounds.height + pad}
          r={5}
          color={SELECTION_COLOR}
          style="stroke"
          strokeWidth={1.5}
        />
      </Group>
    );
  }, [state.selectedElementId, state.layers, selectionTransform]);

  const renderGrid = useMemo(() => {
    if (!state.showGrid) return null;
    const path = Skia.Path.Make();
    const size = state.gridSize;
    for (let x = 0; x <= 2000; x += size) {
      path.moveTo(x, 0);
      path.lineTo(x, 2000);
    }
    for (let y = 0; y <= 2000; y += size) {
      path.moveTo(0, y);
      path.lineTo(2000, y);
    }
    return (
      <Path
        path={path}
        color={state.isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
        style="stroke"
        strokeWidth={1}
      />
    );
  }, [state.showGrid, state.gridSize, state.isDarkMode]);

  const isEmpty =
    state.layers.every((l) => l.elements.length === 0) && !currentPath;

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[styles.container, { backgroundColor: state.canvasBackground }]}
      >
        <Canvas style={styles.canvas}>
          {renderGrid}
          <Group layer>
            {renderedLayers}
            {currentPath && (
              <Path
                path={currentPath}
                color={
                  state.selectedTool === 'eraser'
                    ? '#000000'
                    : state.activeColor
                }
                style="stroke"
                strokeWidth={
                  state.selectedTool === 'eraser'
                    ? state.activeStrokeWidth * 5
                    : state.activeStrokeWidth
                }
                strokeCap="round"
                strokeJoin="round"
                blendMode={
                  state.selectedTool === 'eraser' ? 'clear' : 'srcOver'
                }
              >
                {state.selectedTool === 'brush' && (
                  <BlurMask blur={state.activeBlur} style="normal" />
                )}
                {state.selectedTool === 'pen' && state.activeRoughness > 0 ? (
                  <DiscretePathEffect
                    length={2}
                    deviation={state.activeRoughness}
                  />
                ) : null}
              </Path>
            )}
            {selectionOverlay}
          </Group>
        </Canvas>

        {isEmpty && (
          <View style={styles.overlay} pointerEvents="none">
            <Text style={[styles.overlayTitle, { color: theme.sub }]}>
              Start Creating
            </Text>
            <Text style={[styles.overlaySub, { color: theme.sub }]}>
              Use the tools below to draw or add shapes
            </Text>
          </View>
        )}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
  },
  overlayTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  overlaySub: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: '500',
  },
});
