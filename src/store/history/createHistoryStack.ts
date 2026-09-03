// others
import { HISTORY_LIMIT } from './constants';

// types
import { TDesignSnapshot } from 'store/design/types';
import { TVectorSelectionSnapshot } from 'types/design/canvas/types';

export type THistorySnapshot = {
  design: TDesignSnapshot;
  vectorSelection: TVectorSelectionSnapshot;
};

export type THistoryStack = {
  beginGesture: (snapshot: THistorySnapshot) => void;
  canRedo: () => boolean;
  canUndo: () => boolean;
  endGesture: () => void;
  pushIfUndoable: (currentSnapshot: THistorySnapshot) => void;
  redo: (currentSnapshot: THistorySnapshot) => THistorySnapshot | null;
  subscribe: (listener: () => void) => () => void;
  undo: (currentSnapshot: THistorySnapshot) => THistorySnapshot | null;
};

export const createHistoryStack = (): THistoryStack => {
  let past: THistorySnapshot[] = [];
  let future: THistorySnapshot[] = [];
  let gestureOpen = false;
  let pendingSnapshot: THistorySnapshot | null = null;
  let snapshotPushedThisGesture = false;
  const listeners = new Set<() => void>();

  const emit = (): void => {
    listeners.forEach((listener) => listener());
  };

  const pushPast = (snapshot: THistorySnapshot): void => {
    past = [...past, snapshot].slice(-HISTORY_LIMIT);
    future = [];
    emit();
  };

  return {
    beginGesture: (snapshot): void => {
      gestureOpen = true;
      pendingSnapshot = snapshot;
      snapshotPushedThisGesture = false;
    },
    canRedo: (): boolean => future.length > 0,
    canUndo: (): boolean => past.length > 0,
    endGesture: (): void => {
      gestureOpen = false;
      pendingSnapshot = null;
    },
    pushIfUndoable: (currentSnapshot): void => {
      if (!gestureOpen) {
        pushPast(currentSnapshot);
      } else if (!snapshotPushedThisGesture && pendingSnapshot) {
        pushPast(pendingSnapshot);
        snapshotPushedThisGesture = true;
      }
    },
    redo: (currentSnapshot): THistorySnapshot | null => {
      if (future.length > 0) {
        const snapshot = future[future.length - 1];

        future = future.slice(0, -1);
        past = [...past, currentSnapshot].slice(-HISTORY_LIMIT);
        emit();

        return snapshot;
      }

      return null;
    },
    subscribe: (listener): (() => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    undo: (currentSnapshot): THistorySnapshot | null => {
      if (past.length > 0) {
        const snapshot = past[past.length - 1];

        past = past.slice(0, -1);
        future = [...future, currentSnapshot].slice(-HISTORY_LIMIT);
        emit();

        return snapshot;
      }

      return null;
    },
  };
};
