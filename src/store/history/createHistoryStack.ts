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
  endGesture: () => void;
  pushIfUndoable: (currentSnapshot: THistorySnapshot) => void;
  redo: (currentSnapshot: THistorySnapshot) => THistorySnapshot | null;
  undo: (currentSnapshot: THistorySnapshot) => THistorySnapshot | null;
};

export const createHistoryStack = (): THistoryStack => {
  let past: THistorySnapshot[] = [];
  let future: THistorySnapshot[] = [];
  let gestureOpen = false;
  let pendingSnapshot: THistorySnapshot | null = null;
  let snapshotPushedThisGesture = false;

  const pushPast = (snapshot: THistorySnapshot): void => {
    past = [...past, snapshot].slice(-HISTORY_LIMIT);
    future = [];
  };

  return {
    beginGesture: (snapshot): void => {
      gestureOpen = true;
      pendingSnapshot = snapshot;
      snapshotPushedThisGesture = false;
    },

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

        return snapshot;
      }

      return null;
    },
    undo: (currentSnapshot): THistorySnapshot | null => {
      if (past.length > 0) {
        const snapshot = past[past.length - 1];

        past = past.slice(0, -1);
        future = [...future, currentSnapshot].slice(-HISTORY_LIMIT);

        return snapshot;
      }

      return null;
    },
  };
};
