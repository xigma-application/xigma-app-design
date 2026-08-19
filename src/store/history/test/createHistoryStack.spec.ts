// types
import { TDesignSnapshot } from 'store/design/types';

// utils
import { createHistoryStack } from '../createHistoryStack';

const snapshot = (id: string): TDesignSnapshot => ({ nodes: {}, rootOrder: [id], selectedIds: [] });

describe('createHistoryStack', () => {
  it('should return null from undo when nothing was ever pushed', () => {
    // before
    const historyStack = createHistoryStack();

    // result
    expect(historyStack.undo(snapshot('current'))).toBeNull();
  });

  it('should return null from redo when nothing was ever undone', () => {
    // before
    const historyStack = createHistoryStack();

    // result
    expect(historyStack.redo(snapshot('current'))).toBeNull();
  });

  it('should undo to the last pushed snapshot and allow redo back to the current one', () => {
    // before
    const historyStack = createHistoryStack();

    historyStack.pushIfUndoable(snapshot('a'));

    // action
    const undone = historyStack.undo(snapshot('b'));

    // result
    expect(undone).toEqual(snapshot('a'));
    expect(historyStack.redo(snapshot('a'))).toEqual(snapshot('b'));
  });

  it('should clear the redo stack once a new snapshot is pushed', () => {
    // before
    const historyStack = createHistoryStack();

    historyStack.pushIfUndoable(snapshot('a'));
    historyStack.undo(snapshot('b'));
    historyStack.pushIfUndoable(snapshot('c'));

    // result
    expect(historyStack.redo(snapshot('c'))).toBeNull();
  });

  it('should push only the gesture-start snapshot once for every undoable action inside a gesture', () => {
    // before
    const historyStack = createHistoryStack();

    historyStack.beginGesture(snapshot('gesture-start'));
    historyStack.pushIfUndoable(snapshot('mid-drag'));
    historyStack.pushIfUndoable(snapshot('mid-drag-2'));

    // result — undoing once returns straight to the gesture-start snapshot, not an intermediate one
    expect(historyStack.undo(snapshot('final'))).toEqual(snapshot('gesture-start'));
    expect(historyStack.undo(snapshot('gesture-start'))).toBeNull();
  });

  it('should resume pushing on every undoable action once the gesture ends', () => {
    // before
    const historyStack = createHistoryStack();

    historyStack.beginGesture(snapshot('gesture-start'));
    historyStack.pushIfUndoable(snapshot('mid-drag'));
    historyStack.endGesture();
    historyStack.pushIfUndoable(snapshot('after-gesture'));

    // result — two separate undo steps: the post-gesture push, then the gesture-start snapshot
    expect(historyStack.undo(snapshot('final'))).toEqual(snapshot('after-gesture'));
    expect(historyStack.undo(snapshot('after-gesture'))).toEqual(snapshot('gesture-start'));
  });
});
