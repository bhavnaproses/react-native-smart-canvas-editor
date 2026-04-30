import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView as RNScrollView,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSmartCanvas } from '../Provider';

const PRESET_COLORS = [
  '#6366F1',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EF4444',
  '#000000',
  '#FFFFFF',
  '#94A3B8',
];

export const PropertiesPanel: React.FC = () => {
  const { state, dispatch, theme } = useSmartCanvas();
  const [activeTab, setActiveTab] = useState('Style');

  const translateY = useSharedValue(400);

  useEffect(() => {
    translateY.value = withSpring(state.showProperties ? 0 : 330, {
      damping: 20,
      stiffness: 90,
    });
  }, [state.showProperties, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const selectedElement = useMemo(
    () => state.elements.find((el) => el.id === state.selectedElementId),
    [state.elements, state.selectedElementId]
  );

  const tabs = useMemo(() => {
    const isText =
      selectedElement?.type === 'text' || state.selectedTool === 'text';
    const isShape =
      selectedElement?.type === 'rect' ||
      selectedElement?.type === 'circle' ||
      state.selectedTool === 'shape';
    const isImage =
      selectedElement?.type === 'image' ||
      selectedElement?.type === 'sticker' ||
      state.selectedTool === 'image' ||
      state.selectedTool === 'stickers';

    if (isText) return ['Text', 'Style', 'Arrange', 'Canvas'];
    if (isShape) return ['Shape', 'Style', 'Arrange', 'Canvas'];
    if (isImage) return ['Image', 'Style', 'Arrange', 'Canvas'];

    return ['Style', 'Stroke', 'Arrange', 'Canvas'];
  }, [selectedElement, state.selectedTool]);

  const updateProperty = (updates: any) => {
    if (selectedElement) {
      dispatch({
        type: 'UPDATE_ELEMENT',
        id: selectedElement.id,
        updates,
      });
    }
  };

  const isToolWithGlobalProperties = [
    'pen',
    'brush',
    'shape',
    'text',
    'stickers',
  ].includes(state.selectedTool);
  const isEraser = state.selectedTool === 'eraser';

  const showElementProperties =
    !!selectedElement && state.selectedTool === 'select';
  const showGlobalProperties =
    (isToolWithGlobalProperties || isEraser) && !showElementProperties;

  const currentColor = showElementProperties
    ? selectedElement.color
    : state.activeColor;
  const currentOpacity = showElementProperties
    ? selectedElement.opacity
    : state.activeOpacity;
  const currentStrokeWidth = showElementProperties
    ? selectedElement.strokeWidth
    : state.activeStrokeWidth;
  const currentBlur = showElementProperties
    ? selectedElement.blur || 0
    : state.activeBlur;
  const currentRoughness = showElementProperties
    ? selectedElement.roughness || 0
    : state.activeRoughness;

  const handleColorChange = (color: string) => {
    if (showElementProperties) {
      updateProperty({ color });
    } else {
      dispatch({
        type: 'SET_ACTIVE_PROPERTY',
        updates: { activeColor: color },
      });
    }
  };

  const handleOpacityChange = (opacity: number) => {
    if (showElementProperties) {
      updateProperty({ opacity });
    } else {
      dispatch({
        type: 'SET_ACTIVE_PROPERTY',
        updates: { activeOpacity: opacity },
      });
    }
  };

  const handleStrokeWidthChange = (strokeWidth: number) => {
    if (showElementProperties) {
      updateProperty({ strokeWidth });
    } else {
      dispatch({
        type: 'SET_ACTIVE_PROPERTY',
        updates: { activeStrokeWidth: strokeWidth },
      });
    }
  };

  const handleBlurChange = (blur: number) => {
    if (showElementProperties) {
      updateProperty({ blur });
    } else {
      dispatch({ type: 'SET_ACTIVE_PROPERTY', updates: { activeBlur: blur } });
    }
  };

  const handleRoughnessChange = (roughness: number) => {
    if (showElementProperties) {
      updateProperty({ roughness });
    } else {
      dispatch({
        type: 'SET_ACTIVE_PROPERTY',
        updates: { activeRoughness: roughness },
      });
    }
  };

  const allTools = [
    { id: 'select', icon: '🎯', label: 'Select' },
    { id: 'pen', icon: '✏️', label: 'Pencil' },
    { id: 'brush', icon: '🖌️', label: 'Brush' },
    { id: 'eraser', icon: '🧽', label: 'Eraser' },
    { id: 'shape', icon: '⬛', label: 'Shape' },
    { id: 'text', icon: 'T', label: 'Text' },
    { id: 'image', icon: '🖼️', label: 'Image' },
    { id: 'stickers', icon: '😊', label: 'Stickers' },
    { id: 'canvas', icon: '🖼️', label: 'Canvas' },
    { id: 'layers', icon: '🥞', label: 'Layers' },
  ];

  return (
    <>
      {/* Removed floating edit button as tools are now always visible */}

      <View style={styles.outerContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.propertiesContainer,
            { backgroundColor: theme.panel, borderTopColor: theme.border },
            animatedStyle,
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {showElementProperties
                ? `${selectedElement.type.toUpperCase()} Properties`
                : showGlobalProperties
                  ? `${state.selectedTool.toUpperCase()} Properties`
                  : 'Edit Menu'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() =>
                dispatch({ type: 'SET_SHOW_PROPERTIES', show: false })
              }
            >
              <Text style={[styles.closeIcon, { color: theme.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.tab,
                    isActive && { borderBottomColor: theme.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: isActive ? theme.primary : theme.sub },
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <RNScrollView style={styles.content}>
            {activeTab === 'Text' && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: theme.text, marginBottom: 12 },
                  ]}
                >
                  Text Content
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  {/* Simplified text input for now as it's a demo */}
                  <TouchableOpacity
                    onPress={() => {
                      // In a real app, this would open a text input or prompt
                      const newText = 'Updated Text';
                      if (showElementProperties)
                        updateProperty({ text: newText });
                    }}
                  >
                    <Text style={{ color: theme.text }}>
                      {showElementProperties
                        ? selectedElement?.text || 'New Text'
                        : 'New Text'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.sliderGroup, { marginTop: 24 }]}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      Font Size
                    </Text>
                    <Text style={[styles.settingValue, { color: theme.text }]}>
                      {showElementProperties ? selectedElement.fontSize : 24}px
                    </Text>
                  </View>
                  <View style={styles.controlsRow}>
                    <TouchableOpacity
                      onPress={() => {
                        const current =
                          showElementProperties && selectedElement?.fontSize
                            ? selectedElement.fontSize
                            : 24;
                        if (showElementProperties)
                          updateProperty({
                            fontSize: Math.max(8, current - 2),
                          });
                      }}
                      style={styles.stepButton}
                    >
                      <Text style={{ color: theme.text }}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.track}>
                      <View
                        style={[
                          styles.progress,
                          {
                            width: `${(((showElementProperties ? selectedElement?.fontSize || 24 : 24) - 8) / 64) * 100}%`,
                            backgroundColor: theme.primary,
                          },
                        ]}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        const current =
                          showElementProperties && selectedElement?.fontSize
                            ? selectedElement.fontSize
                            : 24;
                        if (showElementProperties)
                          updateProperty({
                            fontSize: Math.min(72, current + 2),
                          });
                      }}
                      style={styles.stepButton}
                    >
                      <Text style={{ color: theme.text }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'Image' && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: theme.text, marginBottom: 12 },
                  ]}
                >
                  Image / Sticker
                </Text>
                <TouchableOpacity
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      alignItems: 'center',
                    },
                  ]}
                  onPress={() => {
                    // Simulate image selection
                    if (showElementProperties)
                      updateProperty({ color: '#F59E0B' }); // Change color as feedback
                  }}
                >
                  <Text style={{ color: theme.text }}>Choose from Gallery</Text>
                </TouchableOpacity>

                <View style={[styles.sliderGroup, { marginTop: 24 }]}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      Scale
                    </Text>
                    <Text style={[styles.settingValue, { color: theme.text }]}>
                      {showElementProperties
                        ? Math.round(
                            ((selectedElement?.width || 100) / 100) * 100
                          )
                        : 100}
                      %
                    </Text>
                  </View>
                  <View style={styles.controlsRow}>
                    <TouchableOpacity
                      onPress={() => {
                        if (showElementProperties) {
                          const newW = Math.max(
                            20,
                            (selectedElement.width || 100) - 10
                          );
                          const newH = Math.max(
                            20,
                            (selectedElement.height || 100) - 10
                          );
                          updateProperty({ width: newW, height: newH });
                        }
                      }}
                      style={styles.stepButton}
                    >
                      <Text style={{ color: theme.text }}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.track}>
                      <View
                        style={[
                          styles.progress,
                          {
                            width: `${(((showElementProperties ? selectedElement?.width || 100 : 100) - 20) / 180) * 100}%`,
                            backgroundColor: theme.primary,
                          },
                        ]}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (showElementProperties) {
                          const newW = Math.min(
                            300,
                            (selectedElement.width || 100) + 10
                          );
                          const newH = Math.min(
                            300,
                            (selectedElement.height || 100) + 10
                          );
                          updateProperty({ width: newW, height: newH });
                        }
                      }}
                      style={styles.stepButton}
                    >
                      <Text style={{ color: theme.text }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'Shape' && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: theme.text, marginBottom: 12 },
                  ]}
                >
                  Shape Type
                </Text>
                <View style={styles.shapeToggleRow}>
                  <TouchableOpacity
                    onPress={() =>
                      showElementProperties && updateProperty({ type: 'rect' })
                    }
                    style={[
                      styles.shapeToggleButton,
                      selectedElement?.type === 'rect' && {
                        backgroundColor: theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          selectedElement?.type === 'rect'
                            ? '#fff'
                            : theme.text,
                      }}
                    >
                      Rect
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      showElementProperties &&
                      updateProperty({ type: 'circle' })
                    }
                    style={[
                      styles.shapeToggleButton,
                      selectedElement?.type === 'circle' && {
                        backgroundColor: theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          selectedElement?.type === 'circle'
                            ? '#fff'
                            : theme.text,
                      }}
                    >
                      Circle
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={[
                    styles.settingLabel,
                    { color: theme.text, marginTop: 24, marginBottom: 12 },
                  ]}
                >
                  Shape Dimensions
                </Text>

                <View style={styles.sliderGroup}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      Width
                    </Text>
                    <Text style={[styles.settingValue, { color: theme.text }]}>
                      {showElementProperties ? selectedElement.width : 100}px
                    </Text>
                  </View>
                  <View style={styles.controlsRow}>
                    <TouchableOpacity
                      onPress={() =>
                        showElementProperties &&
                        selectedElement &&
                        updateProperty({
                          width: Math.max(
                            10,
                            (selectedElement.width || 100) - 10
                          ),
                        })
                      }
                      style={styles.stepButton}
                    >
                      <Text style={{ color: theme.text }}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.track}>
                      <View
                        style={[
                          styles.progress,
                          {
                            width: `${(((showElementProperties ? selectedElement?.width || 100 : 100) - 10) / 200) * 100}%`,
                            backgroundColor: theme.primary,
                          },
                        ]}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        showElementProperties &&
                        selectedElement &&
                        updateProperty({
                          width: Math.min(
                            300,
                            (selectedElement.width || 100) + 10
                          ),
                        })
                      }
                      style={styles.stepButton}
                    >
                      <Text style={{ color: theme.text }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.sliderGroup}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      Height
                    </Text>
                    <Text style={[styles.settingValue, { color: theme.text }]}>
                      {showElementProperties ? selectedElement.height : 100}px
                    </Text>
                  </View>
                  <View style={styles.controlsRow}>
                    <TouchableOpacity
                      onPress={() =>
                        showElementProperties &&
                        selectedElement &&
                        updateProperty({
                          height: Math.max(
                            10,
                            (selectedElement.height || 100) - 10
                          ),
                        })
                      }
                      style={styles.stepButton}
                    >
                      <Text style={{ color: theme.text }}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.track}>
                      <View
                        style={[
                          styles.progress,
                          {
                            width: `${((showElementProperties ? (selectedElement?.height || 100) - 10 : 90) / 200) * 100}%`,
                            backgroundColor: theme.primary,
                          },
                        ]}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        showElementProperties &&
                        selectedElement &&
                        updateProperty({
                          height: Math.min(
                            300,
                            (selectedElement.height || 100) + 10
                          ),
                        })
                      }
                      style={styles.stepButton}
                    >
                      <Text style={{ color: theme.text }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'Style' && (
              <>
                {!isEraser && (
                  <View style={styles.section}>
                    <Text
                      style={[
                        styles.settingLabel,
                        { color: theme.text, marginBottom: 12 },
                      ]}
                    >
                      Color
                    </Text>
                    <View style={styles.colorGrid}>
                      {PRESET_COLORS.map((color) => (
                        <TouchableOpacity
                          key={color}
                          onPress={() => handleColorChange(color)}
                          style={[
                            styles.colorCircle,
                            { backgroundColor: color },
                            currentColor === color && {
                              borderColor: theme.text,
                              borderWidth: 2,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {!isEraser && (
                  <View style={styles.sliderGroup}>
                    <View style={styles.sliderHeader}>
                      <Text
                        style={[styles.settingLabel, { color: theme.text }]}
                      >
                        Opacity
                      </Text>
                      <Text
                        style={[styles.settingValue, { color: theme.text }]}
                      >
                        {Math.round(currentOpacity * 100)}%
                      </Text>
                    </View>
                    <View style={styles.controlsRow}>
                      <TouchableOpacity
                        onPress={() =>
                          handleOpacityChange(Math.max(0, currentOpacity - 0.1))
                        }
                        style={styles.stepButton}
                      >
                        <Text style={{ color: theme.text }}>−</Text>
                      </TouchableOpacity>
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.progress,
                            {
                              width: `${currentOpacity * 100}%`,
                              backgroundColor: theme.primary,
                            },
                          ]}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          handleOpacityChange(Math.min(1, currentOpacity + 0.1))
                        }
                        style={styles.stepButton}
                      >
                        <Text style={{ color: theme.text }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}

            {activeTab === 'Stroke' && (
              <>
                <View style={styles.sliderGroup}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {isEraser ? 'Eraser Size' : 'Stroke Width'}
                    </Text>
                    <Text style={[styles.settingValue, { color: theme.text }]}>
                      {currentStrokeWidth}px
                    </Text>
                  </View>
                  <View style={styles.controlsRow}>
                    <TouchableOpacity
                      onPress={() =>
                        handleStrokeWidthChange(
                          Math.max(1, currentStrokeWidth - 1)
                        )
                      }
                      style={styles.stepButton}
                    >
                      <Text style={{ color: theme.text }}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.track}>
                      <View
                        style={[
                          styles.progress,
                          {
                            width: `${(currentStrokeWidth / 20) * 100}%`,
                            backgroundColor: theme.primary,
                          },
                        ]}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleStrokeWidthChange(
                          Math.min(20, currentStrokeWidth + 1)
                        )
                      }
                      style={styles.stepButton}
                    >
                      <Text style={{ color: theme.text }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {(state.selectedTool === 'brush' ||
                  (selectedElement && selectedElement.type === 'brush')) && (
                  <View style={styles.sliderGroup}>
                    <View style={styles.sliderHeader}>
                      <Text
                        style={[styles.settingLabel, { color: theme.text }]}
                      >
                        Brush Softness
                      </Text>
                      <Text
                        style={[styles.settingValue, { color: theme.text }]}
                      >
                        {Math.round(currentBlur)}px
                      </Text>
                    </View>
                    <View style={styles.controlsRow}>
                      <TouchableOpacity
                        onPress={() =>
                          handleBlurChange(Math.max(0, currentBlur - 1))
                        }
                        style={styles.stepButton}
                      >
                        <Text style={{ color: theme.text }}>−</Text>
                      </TouchableOpacity>
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.progress,
                            {
                              width: `${(currentBlur / 20) * 100}%`,
                              backgroundColor: theme.primary,
                            },
                          ]}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          handleBlurChange(Math.min(20, currentBlur + 1))
                        }
                        style={styles.stepButton}
                      >
                        <Text style={{ color: theme.text }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {(state.selectedTool === 'pen' ||
                  (selectedElement && selectedElement.type === 'path')) && (
                  <View style={styles.sliderGroup}>
                    <View style={styles.sliderHeader}>
                      <Text
                        style={[styles.settingLabel, { color: theme.text }]}
                      >
                        Pencil Roughness
                      </Text>
                      <Text
                        style={[styles.settingValue, { color: theme.text }]}
                      >
                        {Math.round(currentRoughness * 10)}%
                      </Text>
                    </View>
                    <View style={styles.controlsRow}>
                      <TouchableOpacity
                        onPress={() =>
                          handleRoughnessChange(
                            Math.max(0, currentRoughness - 0.5)
                          )
                        }
                        style={styles.stepButton}
                      >
                        <Text style={{ color: theme.text }}>−</Text>
                      </TouchableOpacity>
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.progress,
                            {
                              width: `${(currentRoughness / 5) * 100}%`,
                              backgroundColor: theme.primary,
                            },
                          ]}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          handleRoughnessChange(
                            Math.min(5, currentRoughness + 0.5)
                          )
                        }
                        style={styles.stepButton}
                      >
                        <Text style={{ color: theme.text }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}

            {(activeTab === 'Canvas' || state.selectedTool === 'canvas') && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: theme.text, marginBottom: 12 },
                  ]}
                >
                  Canvas Background
                </Text>
                <View style={styles.colorGrid}>
                  {PRESET_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() =>
                        dispatch({ type: 'SET_CANVAS_BACKGROUND', color })
                      }
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color },
                        state.canvasBackground === color && {
                          borderColor: theme.text,
                          borderWidth: 2,
                        },
                      ]}
                    />
                  ))}
                </View>

                <View style={[styles.section, { marginTop: 24 }]}>
                  <View style={styles.switchRow}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      Show Grid
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        dispatch({ type: 'SET_GRID', show: !state.showGrid })
                      }
                      style={[
                        styles.switch,
                        {
                          backgroundColor: state.showGrid
                            ? theme.primary
                            : theme.card,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.switchThumb,
                          {
                            transform: [
                              { translateX: state.showGrid ? 20 : 0 },
                            ],
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  </View>

                  {state.showGrid && (
                    <View style={[styles.sliderGroup, { marginTop: 16 }]}>
                      <View style={styles.sliderHeader}>
                        <Text
                          style={[styles.settingLabel, { color: theme.text }]}
                        >
                          Grid Size
                        </Text>
                        <Text
                          style={[styles.settingValue, { color: theme.text }]}
                        >
                          {state.gridSize}px
                        </Text>
                      </View>
                      <View style={styles.controlsRow}>
                        <TouchableOpacity
                          onPress={() =>
                            dispatch({
                              type: 'SET_GRID',
                              show: true,
                              size: Math.max(10, state.gridSize - 5),
                            })
                          }
                          style={styles.stepButton}
                        >
                          <Text style={{ color: theme.text }}>−</Text>
                        </TouchableOpacity>
                        <View style={styles.track}>
                          <View
                            style={[
                              styles.progress,
                              {
                                width: `${((state.gridSize - 10) / 40) * 100}%`,
                                backgroundColor: theme.primary,
                              },
                            ]}
                          />
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            dispatch({
                              type: 'SET_GRID',
                              show: true,
                              size: Math.min(50, state.gridSize + 5),
                            })
                          }
                          style={styles.stepButton}
                        >
                          <Text style={{ color: theme.text }}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                <Text
                  style={{
                    color: theme.sub,
                    marginTop: 20,
                    textAlign: 'center',
                  }}
                >
                  Configure your workspace for precise editing.
                </Text>
              </View>
            )}

            {activeTab === 'Arrange' && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: theme.text, marginBottom: 12 },
                  ]}
                >
                  Layer Order
                </Text>
                <View style={styles.arrangeRow}>
                  <TouchableOpacity
                    style={[
                      styles.arrangeButton,
                      { backgroundColor: theme.card },
                    ]}
                    onPress={() =>
                      selectedElement &&
                      dispatch({
                        type: 'MOVE_TO_FRONT',
                        id: selectedElement.id,
                      })
                    }
                  >
                    <Text style={{ color: theme.text }}>Bring to Front</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.arrangeButton,
                      { backgroundColor: theme.card },
                    ]}
                    onPress={() =>
                      selectedElement &&
                      dispatch({ type: 'MOVE_TO_BACK', id: selectedElement.id })
                    }
                  >
                    <Text style={{ color: theme.text }}>Send to Back</Text>
                  </TouchableOpacity>
                </View>
                {!selectedElement && (
                  <Text
                    style={{
                      color: theme.sub,
                      marginTop: 12,
                      textAlign: 'center',
                    }}
                  >
                    Select an element to arrange layers.
                  </Text>
                )}
              </View>
            )}
          </RNScrollView>
        </Animated.View>

        {/* Persistent Bottom Tool Menu */}
        <View
          style={[
            styles.bottomToolbar,
            { backgroundColor: theme.panel, borderTopColor: theme.border },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolsScroll}
            style={{ flex: 1, width: '100%' }}
          >
            {allTools.map((tool) => {
              const isActive = state.selectedTool === tool.id;
              return (
                <TouchableOpacity
                  key={tool.id}
                  style={styles.bottomTool}
                  onPress={() => {
                    dispatch({ type: 'SET_TOOL', tool: tool.id });
                    // Always show properties when a tool is selected, except for the 'select' tool
                    if (!state.showProperties && tool.id !== 'select') {
                      dispatch({ type: 'SET_SHOW_PROPERTIES', show: true });
                    }
                  }}
                >
                  <View
                    style={[
                      styles.bottomToolIconContainer,
                      isActive && { backgroundColor: theme.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bottomToolIcon,
                        { color: isActive ? '#fff' : theme.text },
                      ]}
                    >
                      {tool.icon}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.bottomToolLabel,
                      { color: isActive ? theme.primary : theme.text },
                    ]}
                  >
                    {tool.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 420,
    zIndex: 1000,
  },
  propertiesContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    height: 330,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 24,
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  sliderGroup: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingValue: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progress: {
    height: 4,
    borderRadius: 2,
  },
  bottomToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    borderTopWidth: 1,
    paddingBottom: 10,
    zIndex: 1100,
  },
  toolsScroll: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomTool: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  bottomToolIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bottomToolIcon: {
    fontSize: 20,
  },
  bottomToolLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  arrangeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  arrangeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  inputContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 45,
    justifyContent: 'center',
  },
  shapeToggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shapeToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
