import { useState, useCallback } from 'react';

export const useUndoRedo = (initialState: any[]) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [canRedo]);

  const push = useCallback(
    (newState: any[]) => {
      const nextHistory = history.slice(0, currentIndex + 1);
      nextHistory.push(newState);
      setHistory(nextHistory);
      setCurrentIndex(nextHistory.length - 1);
    },
    [history, currentIndex]
  );

  return {
    state: history[currentIndex],
    undo,
    redo,
    push,
    canUndo,
    canRedo,
  };
};
