import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useMediaToolHintCloseClick } from '../useMediaToolHintCloseClick';

// store
import { selectActiveTool } from 'store/design/selectors';
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useMediaToolHintCloseClick', () => {
  it('should revert to the default tool when called', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.media));

    // before
    const { result } = renderHook(() => useMediaToolHintCloseClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectActiveTool(store.getState())).toBe(ToolName.default);
  });
});
