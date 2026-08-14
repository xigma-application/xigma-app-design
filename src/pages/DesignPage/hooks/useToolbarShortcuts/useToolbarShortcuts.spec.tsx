import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { fireEvent, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useToolbarShortcuts } from './useToolbarShortcuts';

// store
import designReducer, { setActiveTool } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

// types
import { ToolName } from 'types/design/enums';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const renderShortcuts = (store: EnhancedStore<{ design: TDesignState }>): void => {
  renderHook(() => useToolbarShortcuts(), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useToolbarShortcuts behaviors', () => {
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

  it('should not switch to the section tool on a plain "S" without the shift modifier', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyS' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
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

  it('should not switch to the media tool on a plain "K" without the modifiers', () => {
    // mock
    const store = createTestStore();

    // before
    renderShortcuts(store);

    // action
    fireEvent.keyDown(window, { code: 'KeyK' });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
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
});
