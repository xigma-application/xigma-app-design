import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// core
import CanvasRefsProvider from 'pages/DesignPage/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useSelectGroupTool } from '../useSelectGroupTool';

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

describe('useSelectGroupTool behaviors', () => {
  afterEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should switch the active tool', () => {
    // before
    const { result } = renderHook(() => useSelectGroupTool(), { wrapper });

    // action
    result.current(ToolName.ellipse)();

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.ellipse);
  });

  it('should leave Vector Edit Mode when a non-pen-group tool is picked', () => {
    // before
    store.dispatch(setVectorEditingNodeId('node-1'));

    const { result } = renderHook(() => useSelectGroupTool(), { wrapper });

    // action
    result.current(ToolName.ellipse)();

    // result
    expect(store.getState().design.vectorEditingNodeId).toBeNull();
  });

  it('should keep Vector Edit Mode open when the pencil tool is picked', () => {
    // before
    store.dispatch(setVectorEditingNodeId('node-1'));

    const { result } = renderHook(() => useSelectGroupTool(), { wrapper });

    // action
    result.current(ToolName.pencil)();

    // result
    expect(store.getState().design.vectorEditingNodeId).toBe('node-1');
  });
});
