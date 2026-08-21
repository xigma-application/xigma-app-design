import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// core
import CanvasRefsProvider from 'pages/DesignPage/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useSelectTool } from '../useSelectTool';

// store
import { setActiveTool, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsProvider>{children}</CanvasRefsProvider>
  </Provider>
);

describe('useSelectTool behaviors', () => {
  afterEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should switch the active tool', () => {
    // before
    const { result } = renderHook(() => useSelectTool(), { wrapper });

    // action
    result.current(ToolName.frame);

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.frame);
  });

  it('should ignore the empty value Radix fires when the pressed toggle item is deselected', () => {
    // before
    store.dispatch(setActiveTool(ToolName.frame));

    const { result } = renderHook(() => useSelectTool(), { wrapper });

    // action
    result.current('');

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.frame);
  });

  it('should leave Vector Edit Mode when a non-pen-group tool is picked', () => {
    // before
    store.dispatch(setVectorEditingNodeId('node-1'));

    const { result } = renderHook(() => useSelectTool(), { wrapper });

    // action
    result.current(ToolName.rectangle);

    // result
    expect(store.getState().design.vectorEditingNodeId).toBeNull();
  });
});
