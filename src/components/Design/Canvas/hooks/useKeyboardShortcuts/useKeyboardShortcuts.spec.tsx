import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { fireEvent, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

// store
import designReducer, { addNode, setActiveTool, setSelection } from 'store/design/slice';
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
