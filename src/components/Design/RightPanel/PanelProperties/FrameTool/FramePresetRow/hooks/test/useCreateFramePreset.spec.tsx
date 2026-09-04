import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useCreateFramePreset } from '../useCreateFramePreset';

// store
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsProvider>{children}</CanvasRefsProvider>
  </Provider>
);

describe('useCreateFramePreset', () => {
  it('should return a callable function', () => {
    // before
    const { result } = renderHook(() => useCreateFramePreset(), { wrapper });

    // result
    expect(typeof result.current).toBe('function');
  });

  it('should do nothing when the canvas is not mounted yet', () => {
    // before
    const { result } = renderHook(() => useCreateFramePreset(), { wrapper });

    // action
    act(() => result.current({ height: 874, label: 'iPhone 17', width: 402 }));

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(0);
  });
});
