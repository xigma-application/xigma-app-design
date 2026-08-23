import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSelectVectorEditTool } from '../useSelectVectorEditTool';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderUseSelectVectorEditTool = (
  toolName: ToolName | undefined,
): ReturnType<typeof renderHook<ReturnType<typeof useSelectVectorEditTool>, unknown>> =>
  renderHook(() => useSelectVectorEditTool(toolName), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

describe('useSelectVectorEditTool', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should return undefined when the tool has no ToolName', () => {
    // before
    const { result } = renderUseSelectVectorEditTool(undefined);

    // result
    expect(result.current).toBeUndefined();
  });

  it('should dispatch setActiveTool with the given tool name when called', () => {
    // before
    const { result } = renderUseSelectVectorEditTool(ToolName.bend);

    // action
    result.current?.();

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.bend);
  });
});
