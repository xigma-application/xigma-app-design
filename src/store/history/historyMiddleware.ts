import { Middleware, UnknownAction } from '@reduxjs/toolkit';

// store
import { beginHistoryGesture, endHistoryGesture, redo, undo } from './actions';
import { addNode, deleteNode, replaceDesignSnapshot, updateNode } from 'store/design/slice';
import { RootState } from 'store';

// utils
import { createHistoryStack } from './createHistoryStack';
import { getDesignSnapshot } from './getDesignSnapshot';

const UNDOABLE_ACTION_TYPES: Set<string> = new Set([addNode.type, updateNode.type, deleteNode.type]);

export const createHistoryMiddleware = (): Middleware<object, RootState> => {
  const historyStack = createHistoryStack();

  return (store) => (next) => (action) => {
    const typedAction = action as UnknownAction;

    switch (true) {
      case beginHistoryGesture.match(typedAction):
        historyStack.beginGesture(getDesignSnapshot(store.getState()));
        return next(action);
      case endHistoryGesture.match(typedAction):
        historyStack.endGesture();
        return next(action);
      case undo.match(typedAction): {
        const snapshot = historyStack.undo(getDesignSnapshot(store.getState()));
        return snapshot ? next(replaceDesignSnapshot(snapshot)) : undefined;
      }
      case redo.match(typedAction): {
        const snapshot = historyStack.redo(getDesignSnapshot(store.getState()));
        return snapshot ? next(replaceDesignSnapshot(snapshot)) : undefined;
      }
      default:
        if (UNDOABLE_ACTION_TYPES.has(typedAction.type)) {
          historyStack.pushIfUndoable(getDesignSnapshot(store.getState()));
        }

        return next(action);
    }
  };
};
