import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { getIsVectorEditToolActive, useVectorEditToolbar } from '../useVectorEditToolbar';

// store
import { setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderUseVectorEditToolbar = (): ReturnType<typeof renderHook<ReturnType<typeof useVectorEditToolbar>, unknown>> =>
  renderHook(() => useVectorEditToolbar(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

describe('useVectorEditToolbar', () => {
  beforeEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should expose the current vector-editing node ids', () => {
    // before
    store.dispatch(setVectorEditingNodeIds(['node-1']));

    const { result } = renderUseVectorEditToolbar();

    // result
    expect(result.current.vectorEditingNodeIds).toEqual(['node-1']);
  });

  it('should expose the current active tool', () => {
    // before
    store.dispatch(setActiveTool(ToolName.lasso));

    const { result } = renderUseVectorEditToolbar();

    // result
    expect(result.current.activeTool).toBe(ToolName.lasso);
  });

  it('should exit Vector Edit Mode and reset the active tool via handleClose', () => {
    // before
    store.dispatch(setVectorEditingNodeIds(['node-1']));
    store.dispatch(setActiveTool(ToolName.pen));

    const { result } = renderUseVectorEditToolbar();

    // action
    act(() => {
      result.current.handleClose();
    });

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should track the More dropdown open state via handleMoreOpenChange', () => {
    // before
    const { result } = renderUseVectorEditToolbar();

    expect(result.current.isMoreOpen).toBe(false);

    // action
    act(() => {
      result.current.handleMoreOpenChange(true);
    });

    // result
    expect(result.current.isMoreOpen).toBe(true);
  });
});

describe('getIsVectorEditToolActive', () => {
  it('should return false for a tool with no ToolName', () => {
    // result
    expect(getIsVectorEditToolActive(undefined, ToolName.move, false)).toBe(false);
  });

  it('should show Move active when it is the real active tool and Ctrl is not held', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.move, ToolName.move, false)).toBe(true);
  });

  it('should hide Move’s active state while Ctrl is held, even though it is still the real active tool', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.move, ToolName.move, true)).toBe(false);
  });

  it('should show Bend active when it is the real active tool, regardless of Ctrl', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.bend, ToolName.bend, false)).toBe(true);
    expect(getIsVectorEditToolActive(ToolName.bend, ToolName.bend, true)).toBe(true);
  });

  it('should preview Bend as active while Ctrl is held and Move is the real active tool, with no other real tool active', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.bend, ToolName.move, true)).toBe(true);
  });

  it('should not preview Bend when Ctrl is not held, even with Move as the real active tool', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.bend, ToolName.move, false)).toBe(false);
  });

  it('should not preview Bend while some other real tool (not Move) is active, even with Ctrl held', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.bend, ToolName.lasso, true)).toBe(false);
  });

  it('should fall back to a plain equality check for every other tool', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.lasso, ToolName.lasso, false)).toBe(true);
    expect(getIsVectorEditToolActive(ToolName.lasso, ToolName.paint, false)).toBe(false);
  });
});
