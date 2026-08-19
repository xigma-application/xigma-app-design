// others
import { HISTORY_LIMIT } from './constants';

// types
import { TDesignSnapshot } from 'store/design/types';

export type THistoryStack = {
  beginGesture: (snapshot: TDesignSnapshot) => void;
  endGesture: () => void;
  pushIfUndoable: (currentSnapshot: TDesignSnapshot) => void;
  redo: (currentSnapshot: TDesignSnapshot) => TDesignSnapshot | null;
  undo: (currentSnapshot: TDesignSnapshot) => TDesignSnapshot | null;
};

export const createHistoryStack = (): THistoryStack => {
  let past: TDesignSnapshot[] = [];
  let future: TDesignSnapshot[] = [];
  let gestureOpen = false;
  let pendingSnapshot: TDesignSnapshot | null = null;
  let snapshotPushedThisGesture = false;

  const pushPast = (snapshot: TDesignSnapshot): void => {
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
    redo: (currentSnapshot): TDesignSnapshot | null => {
      if (future.length > 0) {
        const snapshot = future[future.length - 1];

        future = future.slice(0, -1);
        past = [...past, currentSnapshot].slice(-HISTORY_LIMIT);

        return snapshot;
      }

      return null;
    },
    undo: (currentSnapshot): TDesignSnapshot | null => {
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
