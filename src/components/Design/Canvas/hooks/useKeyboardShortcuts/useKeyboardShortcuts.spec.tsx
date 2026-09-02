import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

// store
import designReducer, { addNode, setActiveTool, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture, undo } from 'store/history/actions';
import { createHistoryMiddleware } from 'store/history/historyMiddleware';
import { createHistoryStack } from 'store/history/createHistoryStack';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { AppStore, store as realStore } from 'store';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';

// types
import { NodeType, ToolName } from 'types/design/enums';

const createTestStore = (): AppStore => {
  const historyStack = createHistoryStack();

  return configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: historyStack } }).concat(createHistoryMiddleware(historyStack)),
    reducer: { design: designReducer },
  });
};

const renderShortcuts = (store: AppStore): void => {
  renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useKeyboardShortcuts behaviors', () => {
  it('should switch to the frame tool on "F"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyF' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.frame);
  });

  it('should switch to the hand tool on "H"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyH' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.hand);
  });

  it('should switch to the lasso tool on "Q"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyQ' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.lasso);
  });

  it('should switch to the rectangle tool on "R"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyR' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.rectangle);
  });

  it('should switch to the section tool on "Shift+S"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyS', shiftKey: true });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.section);
  });

  it('should switch to the slice tool (not section) on a plain "S" without the shift modifier', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyS' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.slice);
  });

  it('should switch to the line tool on "L"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyL' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.line);
  });

  it('should switch to the arrow tool on "Shift+L"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyL', shiftKey: true });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.arrow);
  });

  it('should switch to the line tool (not arrow) on a plain "L" without the shift modifier', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyL' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.line);
  });

  it('should switch to the ellipse tool on "O"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyO' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.ellipse);
  });

  it('should switch to the pen tool on "P"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyP' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.pen);
  });

  it('should switch to the pencil tool on "Shift+P"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyP', shiftKey: true });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.pencil);
  });

  it('should switch to the pen tool (not pencil) on a plain "P" without the shift modifier', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyP' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.pen);
  });

  it('should switch to the text tool on "T"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyT' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.text);
  });

  it('should switch to the comment tool on "C"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyC' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.comment);
  });

  it('should switch to the cut tool on "X"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyX' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.cut);
  });

  it('should switch to the media tool on "Cmd+Shift+K" (the CONTROL_PRIMARY_KEY resolves to meta on macOS, mocked for this suite)', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyK', metaKey: true, shiftKey: true });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.media);
  });

  it('should switch to the paint tool on "Shift+B"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyB', shiftKey: true });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.paint);
  });

  it('should switch to the erase tool on "Shift+E"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyE', shiftKey: true });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.erase);
  });

  it('should switch to the Shape builder tool on "M"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyM' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.shapeBuilder);
  });

  it('should switch to the scale tool (not media) on a plain "K" without the modifiers', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyK' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.scale);
  });

  it('should switch back to the default tool on "V"', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(ToolName.frame));

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyV' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should switch back to the default tool on "Escape"', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(ToolName.frame));

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'Escape' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should also clear the current selection on "Escape"', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setSelection(['node-1']));

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'Escape' });

    // result
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });

  it('should ignore unrelated keys', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyZ' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should not trigger a shortcut while a modifier key is held', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyF', metaKey: true });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should dispatch redo on "Cmd+Shift+Z"', () => {
    // mock
    const store = createTestStore();

    store.dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
    );
    store.dispatch(endHistoryGesture());

    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];

    store.dispatch(undo());

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyZ', metaKey: true, shiftKey: true });

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toBeDefined();
  });

  it('should dispatch undo on "Cmd+Z"', () => {
    // mock
    const store = createTestStore();

    store.dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
    );
    store.dispatch(endHistoryGesture());

    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyZ', metaKey: true });

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toBeUndefined();
  });

  it('should flatten the selection on "Alt+Shift+F" without throwing when nothing is selected', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    expect(() => fireEvent.keyDown(window, { altKey: true, code: 'KeyF', shiftKey: true })).not.toThrow();
  });

  it('should outline the selection stroke on "Alt+Control+O" without throwing when nothing is selected', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    expect(() => fireEvent.keyDown(window, { altKey: true, code: 'KeyO', ctrlKey: true })).not.toThrow();
  });

  it('should toggle the minimized UI flag on "Cmd+Shift+\\"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'Backslash', metaKey: true, shiftKey: true });

    // result
    expect(store.getState().design.isUiMinimized).toBe(true);

    // action
    fireEvent.keyDown(window, { code: 'Backslash', metaKey: true, shiftKey: true });

    // result
    expect(store.getState().design.isUiMinimized).toBe(false);
  });

  it('should toggle the Actions panel on "Cmd+K"', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyK', metaKey: true });

    // result
    expect(store.getState().design.isActionsPanelOpen).toBe(true);

    // action
    fireEvent.keyDown(window, { code: 'KeyK', metaKey: true });

    // result
    expect(store.getState().design.isActionsPanelOpen).toBe(false);
  });
});

// handleDeleteSelection reads/writes the real store singleton directly (not whatever store wraps the
// component), so these two use the real store + its Provider instead of the local-store helper above
describe('useKeyboardShortcuts delete/backspace behaviors', () => {
  const addFrameNode = (): string => {
    realStore.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
    );

    const { rootOrder } = selectActivePage(realStore.getState());

    return rootOrder[rootOrder.length - 1];
  };

  beforeEach(() => {
    realStore.dispatch(setSelection([]));
  });

  it('should delete the selected node on "Delete"', () => {
    // mock
    const idA = addFrameNode();

    realStore.dispatch(setSelection([idA]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'Delete' });

    // result
    expect(realStore.getState().design.pages[realStore.getState().design.activePageId].nodes[idA]).toBeUndefined();
  });

  it('should delete the selected node on "Backspace"', () => {
    // mock
    const idA = addFrameNode();

    realStore.dispatch(setSelection([idA]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'Backspace' });

    // result
    expect(realStore.getState().design.pages[realStore.getState().design.activePageId].nodes[idA]).toBeUndefined();
  });
});

// handleSelectAll/handleDuplicateSelection/handleCopySelection/handlePasteSelection/handleNudgeSelection
// all read/write the real store singleton directly too, same reasoning as the delete/backspace block above
describe('useKeyboardShortcuts selection-editing behaviors', () => {
  const addFrameNode = (x = 0, y = 0): string => {
    realStore.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x, y }),
    );

    const { rootOrder } = selectActivePage(realStore.getState());

    return rootOrder[rootOrder.length - 1];
  };

  beforeEach(() => {
    realStore.dispatch(setSelection([]));
  });

  it('should select every node on "Cmd+A"', () => {
    // mock
    addFrameNode();
    addFrameNode();

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'KeyA', metaKey: true });

    // result
    expect(selectSelectedIds(realStore.getState())).toEqual(
      realStore.getState().design.pages[realStore.getState().design.activePageId].rootOrder,
    );
  });

  it('should duplicate the selected node on "Cmd+D"', () => {
    // mock
    const idA = addFrameNode();

    realStore.dispatch(setSelection([idA]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'KeyD', metaKey: true });

    // result
    expect(selectSelectedIds(realStore.getState())).toHaveLength(1);
    expect(selectSelectedIds(realStore.getState())).not.toEqual([idA]);
  });

  it('should group the selection on "Cmd+G" and ungroup it again on "Cmd+Shift+G"', () => {
    // mock
    const idA = addFrameNode();
    const idB = addFrameNode(40, 40);

    realStore.dispatch(setSelection([idA, idB]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'KeyG', metaKey: true });

    // result
    const [groupId] = selectSelectedIds(realStore.getState());
    expect(realStore.getState().design.pages[realStore.getState().design.activePageId].nodes[groupId].type).toBe(NodeType.group);

    // action
    fireEvent.keyDown(window, { code: 'KeyG', metaKey: true, shiftKey: true });

    // result
    expect(selectSelectedIds(realStore.getState())).toEqual([idA, idB]);
  });

  it('should wrap the selection into a mask group on "Ctrl+Cmd+M"', () => {
    // mock
    const idA = addFrameNode();
    const idB = addFrameNode(40, 40);

    realStore.dispatch(setSelection([idA, idB]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'KeyM', ctrlKey: true, metaKey: true });

    // result
    const [groupId] = selectSelectedIds(realStore.getState());
    const page = realStore.getState().design.pages[realStore.getState().design.activePageId];
    expect(page.nodes[groupId].type).toBe(NodeType.group);
    expect(page.nodes[groupId].name).toBe('Mask group');
    expect(page.nodes[(page.nodes[groupId] as { childIds: string[] }).childIds.at(-1)!].isMask).toBe(true);
  });

  it('should bring the selection to the front on "]" and send it to the back on "["', () => {
    // mock — idA drawn before idB, so idA starts behind it
    const idA = addFrameNode();
    const idB = addFrameNode(40, 40);
    const orderOf = (id: string): number => selectActivePage(realStore.getState()).rootOrder.indexOf(id);

    expect(orderOf(idA)).toBeLessThan(orderOf(idB));

    realStore.dispatch(setSelection([idA]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action — bring idA to front
    fireEvent.keyDown(window, { code: 'BracketRight' });

    // result — idA is now the very last (front-most) entry, ahead of idB
    expect(orderOf(idA)).toBe(selectActivePage(realStore.getState()).rootOrder.length - 1);
    expect(orderOf(idA)).toBeGreaterThan(orderOf(idB));

    // action — send idA back again
    fireEvent.keyDown(window, { code: 'BracketLeft' });

    // result — idA is now the very first (back-most) entry, behind idB
    expect(orderOf(idA)).toBe(0);
    expect(orderOf(idA)).toBeLessThan(orderOf(idB));
  });

  it('should copy the selected node on "Cmd+C" and paste a clone of it on "Cmd+V"', () => {
    // mock
    const idA = addFrameNode();

    realStore.dispatch(setSelection([idA]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    const nodeCountBeforePaste = Object.keys(realStore.getState().design.pages[realStore.getState().design.activePageId].nodes).length;

    // action
    fireEvent.keyDown(window, { code: 'KeyC', metaKey: true });
    fireEvent.keyDown(window, { code: 'KeyV', metaKey: true });

    // result
    expect(Object.keys(realStore.getState().design.pages[realStore.getState().design.activePageId].nodes)).toHaveLength(
      nodeCountBeforePaste + 1,
    );
  });

  it('should duplicate the selected vertex on "Cmd+D" while a vector node is open for editing', () => {
    // mock
    realStore.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: {},
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { v1: { id: 'v1', x: 0, y: 0 } },
      }),
    );

    const { rootOrder } = selectActivePage(realStore.getState());
    const vectorId = rootOrder[rootOrder.length - 1];

    realStore.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } } });

    // before
    renderHook(() => useKeyboardShortcuts(refs), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'KeyD', metaKey: true });

    // result
    expect(
      Object.keys((realStore.getState().design.pages[realStore.getState().design.activePageId].nodes[vectorId] as any).vertices),
    ).toHaveLength(2);

    // cleanup
    realStore.dispatch(setVectorEditingNodeIds([]));
  });

  it('should nudge the selected node by 1px on "ArrowRight"', () => {
    // mock
    const idA = addFrameNode(10, 10);

    realStore.dispatch(setSelection([idA]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'ArrowRight' });

    // result
    expect(realStore.getState().design.pages[realStore.getState().design.activePageId].nodes[idA]).toMatchObject({ x: 11 });
  });

  it('should nudge the selected node by 10px on "Shift+ArrowRight"', () => {
    // mock
    const idA = addFrameNode(10, 10);

    realStore.dispatch(setSelection([idA]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'ArrowRight', shiftKey: true });

    // result
    expect(realStore.getState().design.pages[realStore.getState().design.activePageId].nodes[idA]).toMatchObject({ x: 20 });
  });
});

// getDefaultMoveTool reads vectorEditingNodeId off the real store singleton too (not whatever store
// wraps the component), so this branch needs the same realStore + Provider setup as the block above
describe('useKeyboardShortcuts "V" behaviors while Vector Edit Mode is active', () => {
  afterEach(() => {
    realStore.dispatch(setVectorEditingNodeIds([]));
  });

  it('should switch to the Vector Edit Move tool (not the plain default tool) on "V" while a node is being vector-edited', () => {
    // mock
    realStore.dispatch(setVectorEditingNodeIds(['node-1']));
    realStore.dispatch(setActiveTool(ToolName.pen));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'KeyV' });

    // result
    expect(realStore.getState().design.activeTool).toBe(ToolName.move);
  });
});

// handleEnterVectorEdit reads/dispatches on the real store singleton too, same reason as the two
// blocks above
describe('useKeyboardShortcuts "Enter" behaviors', () => {
  const addVectorNode = (): string => {
    realStore.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: {},
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { v1: { id: 'v1', x: 0, y: 0 } },
      }),
    );

    const { rootOrder } = selectActivePage(realStore.getState());

    return rootOrder[rootOrder.length - 1];
  };

  const addFrameNode = (): string => {
    realStore.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
    );

    const { rootOrder } = selectActivePage(realStore.getState());

    return rootOrder[rootOrder.length - 1];
  };

  beforeEach(() => {
    realStore.dispatch(setSelection([]));
    realStore.dispatch(setVectorEditingNodeIds([]));
    realStore.dispatch(setActiveTool(ToolName.default));
  });

  it('should open every selected vector node for editing on "Enter" when two or more are selected', () => {
    // mock
    const vectorIdA = addVectorNode();
    const vectorIdB = addVectorNode();

    realStore.dispatch(setSelection([vectorIdA, vectorIdB]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'Enter' });

    // result
    expect(realStore.getState().design.vectorEditingNodeIds).toEqual([vectorIdA, vectorIdB]);
    expect(realStore.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should open a single selected vector node for editing on "Enter"', () => {
    // mock
    const vectorIdA = addVectorNode();

    realStore.dispatch(setSelection([vectorIdA]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'Enter' });

    // result
    expect(realStore.getState().design.vectorEditingNodeIds).toEqual([vectorIdA]);
    expect(realStore.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should do nothing on "Enter" when no vector nodes are selected', () => {
    // mock
    const frameId = addFrameNode();

    realStore.dispatch(setSelection([frameId]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'Enter' });

    // result
    expect(realStore.getState().design.vectorEditingNodeIds).toEqual([]);
  });
});

// dispatchTool.ts's blocking check (isDispatchToolBlocked/getEligibleVectorWidthNodes) reads
// vectorEditingNodeIds/nodes off the real store singleton directly, not whatever store wraps the
// component, so — same reasoning as the blocks above — this needs realStore + its Provider, with a
// single-chain vector node actually open for editing (Variable Width is gated on exactly one eligible
// vector node, see isVectorEditMoreToolDisabled.ts)
describe('useKeyboardShortcuts "Shift+W" behaviors', () => {
  afterEach(() => {
    realStore.dispatch(setVectorEditingNodeIds([]));
    realStore.dispatch(setActiveTool(ToolName.default));
  });

  it('should switch to the Variable width tool on "Shift+W" when a single eligible vector node is open for editing', () => {
    // mock
    realStore.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 } },
      }),
    );

    const { rootOrder } = selectActivePage(realStore.getState());
    const vectorId = rootOrder[rootOrder.length - 1];

    realStore.dispatch(setVectorEditingNodeIds([vectorId]));

    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'KeyW', shiftKey: true });

    // result
    expect(realStore.getState().design.activeTool).toBe(ToolName.variableWidth);
  });

  it('should not switch to the Variable width tool on "Shift+W" when no vector node is open for editing', () => {
    // before
    renderHook(() => useKeyboardShortcuts(createCanvasRefs()), {
      wrapper: ({ children }) => <Provider store={realStore}>{children}</Provider>,
    });

    // action
    fireEvent.keyDown(window, { code: 'KeyW', shiftKey: true });

    // result
    expect(realStore.getState().design.activeTool).not.toBe(ToolName.variableWidth);
  });
});
