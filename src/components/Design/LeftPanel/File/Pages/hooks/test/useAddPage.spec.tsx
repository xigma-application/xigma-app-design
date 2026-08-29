import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useAddPage } from '../useAddPage';

// store
import designReducer from 'store/design/slice';

// types
import { TDesignState } from 'store/design/types';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

describe('useAddPage', () => {
  it('should add a page, expose its id as pending-edit and run the onAdded callback', () => {
    // mock
    const store = createTestStore();
    const onAdded = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

    // before
    const { rerender, result } = renderHook(() => useAddPage(onAdded), { wrapper });

    // action
    act(() => result.current.handleAddPage());
    rerender();

    // result
    const { activePageId, pages } = store.getState().design;
    expect(Object.keys(pages)).toHaveLength(2);
    expect(result.current.pendingEditPageId).toBe(activePageId);
    expect(onAdded).toHaveBeenCalledTimes(1);
  });

  it('should clear pendingEditPageId when clearPendingEditPageId is called', () => {
    // mock
    const store = createTestStore();
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

    // before
    const { rerender, result } = renderHook(() => useAddPage(vi.fn()), { wrapper });
    act(() => result.current.handleAddPage());
    rerender();
    expect(result.current.pendingEditPageId).not.toBeNull();

    // action
    act(() => result.current.clearPendingEditPageId());
    rerender();

    // result
    expect(result.current.pendingEditPageId).toBeNull();
  });
});
