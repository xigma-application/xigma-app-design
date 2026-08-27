import { Middleware, UnknownAction } from '@reduxjs/toolkit';

// store
import { beginHistoryGesture, endHistoryGesture } from './actions';
import { addNode, deleteNode, replaceNode, setSelection, updateNode } from 'store/design/slice';
import { RootState } from 'store';

// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from './constants';

// utils
import { THistoryStack } from './createHistoryStack';
import { getDesignSnapshot } from './getDesignSnapshot';

const UNDOABLE_ACTION_TYPES: Set<string> = new Set([addNode.type, updateNode.type, deleteNode.type, replaceNode.type, setSelection.type]);

export const createHistoryMiddleware = (historyStack: THistoryStack): Middleware<object, RootState> => {
  return (store) => (next) => (action) => {
    const typedAction = action as UnknownAction;

    switch (true) {
      case beginHistoryGesture.match(typedAction):
        historyStack.beginGesture({ design: getDesignSnapshot(store.getState()), vectorSelection: typedAction.payload });
        return next(action);
      case endHistoryGesture.match(typedAction):
        historyStack.endGesture();
        return next(action);
      default:
        if (UNDOABLE_ACTION_TYPES.has(typedAction.type)) {
          historyStack.pushIfUndoable({ design: getDesignSnapshot(store.getState()), vectorSelection: EMPTY_VECTOR_SELECTION_SNAPSHOT });
        }

        return next(action);
    }
  };
};
