import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useSyncResolvedTheme } from '../useSyncResolvedTheme';

// store
import { selectResolvedTheme } from 'store/design/selectors';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useSyncResolvedTheme', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it('should write the current theme into the store on mount', () => {
    // mock
    document.documentElement.dataset.theme = 'light';

    // before
    renderHook(() => useSyncResolvedTheme(), { wrapper });

    // result
    expect(selectResolvedTheme(store.getState())).toBe('light');
  });

  it('should follow a later theme switch on the document', async () => {
    // mock
    document.documentElement.dataset.theme = 'light';
    renderHook(() => useSyncResolvedTheme(), { wrapper });

    // action
    act(() => {
      document.documentElement.dataset.theme = 'dark';
    });

    // wait
    await waitFor(() => expect(selectResolvedTheme(store.getState())).toBe('dark'));
  });

  it('should stop watching the document once unmounted', async () => {
    // mock
    document.documentElement.dataset.theme = 'dark';
    const { unmount } = renderHook(() => useSyncResolvedTheme(), { wrapper });

    // action
    unmount();
    document.documentElement.dataset.theme = 'light';
    await Promise.resolve();

    // result
    expect(selectResolvedTheme(store.getState())).toBe('dark');
  });
});
