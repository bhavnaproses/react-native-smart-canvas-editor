import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { useSmartCanvas } from '../Provider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MENU_SIZE = 220;
const BUTTON_SIZE = 56;

export const RadialMenu: React.FC = () => {
  const { state, dispatch, theme } = useSmartCanvas();
  const [isOpen, setIsOpen] = useState(false);
  const openValue = useSharedValue(0);

  if (!state.showUI) return null;

  const toggleMenu = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    openValue.value = withSpring(nextState ? 1 : 0, {
      damping: 12,
      stiffness: 100,
    });
  };

  const menuStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: openValue.value },
        { rotate: `${interpolate(openValue.value, [0, 1], [45, 0])}deg` },
      ],
      opacity: openValue.value,
    };
  });

  const mainButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${openValue.value * 45}deg` }],
    };
  });

  const menuItems = [
    { id: 'pen', icon: '✏️', label: 'Pencil', angle: -90 },
    { id: 'brush', icon: '🖌️', label: 'Brush', angle: -45 },
    { id: 'eraser', icon: '🧽', label: 'Eraser', angle: 0 },
    { id: 'select', icon: '🎯', label: 'Select', angle: 45 },
    { id: 'undo', icon: '↩️', label: 'Undo', angle: 135 },
    { id: 'redo', icon: '↪️', label: 'Redo', angle: 180 },
    { id: 'clear', icon: '🗑️', label: 'Clear', angle: 225 },
  ];

  const handleAction = (id: string) => {
    if (id === 'undo') dispatch({ type: 'UNDO' });
    else if (id === 'redo') dispatch({ type: 'REDO' });
    else if (id === 'clear') {
        // Implement clear if needed, or just select tool
    } else {
      dispatch({ type: 'SET_TOOL', tool: id });
    }
    toggleMenu();
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Overlay to close menu */}
      {isOpen && (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={toggleMenu}
        />
      )}

      <Animated.View style={[styles.menuWrapper, menuStyle]} pointerEvents={isOpen ? 'auto' : 'none'}>
        <View style={[styles.radialBg, { backgroundColor: theme.panel, borderColor: theme.border }]} />
        {menuItems.map((item) => {
          const radius = 80;
          const rad = (item.angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                {
                  transform: [{ translateX: x }, { translateY: y }],
                  backgroundColor: state.selectedTool === item.id ? theme.primary : theme.card,
                },
              ]}
              onPress={() => handleAction(item.id)}
            >
              <Text style={styles.itemIcon}>{item.icon}</Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleMenu}
        style={[styles.mainButton, { backgroundColor: theme.primary }]}
      >
        <Animated.View style={mainButtonStyle}>
          <Text style={styles.mainButtonText}>+</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: (SCREEN_WIDTH - BUTTON_SIZE) / 2,
    zIndex: 2000,
  },
  overlay: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    left: -(SCREEN_WIDTH - BUTTON_SIZE) / 2,
    bottom: -40,
  },
  menuWrapper: {
    position: 'absolute',
    bottom: 0,
    left: -(MENU_SIZE - BUTTON_SIZE) / 2,
    width: MENU_SIZE,
    height: MENU_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialBg: {
    position: 'absolute',
    width: MENU_SIZE,
    height: MENU_SIZE,
    borderRadius: MENU_SIZE / 2,
    borderWidth: 1,
    opacity: 0.95,
  },
  mainButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainButtonText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '300',
  },
  menuItem: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  itemIcon: {
    fontSize: 20,
  },
});
