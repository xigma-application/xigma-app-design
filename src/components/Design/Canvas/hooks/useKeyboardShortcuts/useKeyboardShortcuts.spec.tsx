import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { fireEvent, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

// store
import designReducer, { addNode, setActiveTool, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { redo, undo } from 'store/history/actions';
import { store as realStore } from 'store';
import { TDesignState } from 'store/design/types';

// types
import { NodeType, ToolName } from 'types/design/enums';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const renderShortcuts = (store: EnhancedStore<{ design: TDesignState }>): void => {
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
    expect(store.getState().design.selectedIds).toEqual([]);
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

    // spy
    vi.spyOn(store, 'dispatch');

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyZ', metaKey: true, shiftKey: true });

    // result
    expect(store.dispatch).toHaveBeenCalledWith(redo());
  });

  it('should dispatch undo on "Cmd+Z"', () => {
    // mock
    const store = createTestStore();

    // spy
    vi.spyOn(store, 'dispatch');

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyZ', metaKey: true });

    // result
    expect(store.dispatch).toHaveBeenCalledWith(undo());
  });
});

// handleDeleteSelection reads/writes the real store singleton directly (not whatever store wraps the
// component), so these two use the real store + its Provider instead of the local-store helper above
describe('useKeyboardShortcuts delete/backspace behaviors', () => {
  const addFrameNode = (): string => {
    realStore.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
    );

    const { rootOrder } = realStore.getState().design;

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
    expect(realStore.getState().design.nodes[idA]).toBeUndefined();
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
    expect(realStore.getState().design.nodes[idA]).toBeUndefined();
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

// handleEnterMultiVectorEdit reads/dispatches on the real store singleton too, same reason as the two
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

    const { rootOrder } = realStore.getState().design;

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

  it('should do nothing on "Enter" when fewer than two vector nodes are selected', () => {
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
    expect(realStore.getState().design.vectorEditingNodeIds).toEqual([]);
  });
});
