import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useContrastBackground } from '../useContrastBackground';

// store
import { setBackgroundPaint } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useContrastBackground', () => {
  afterEach(() => {
    store.dispatch(setBackgroundPaint({ color: '#ffffff', opacity: 100, type: 'solid' }));
  });

  it('should return the page background color when the node is unknown', () => {
    // mock
    store.dispatch(setBackgroundPaint({ color: '#123456', opacity: 100, type: 'solid' }));

    // before
    const { result } = renderHook(() => useContrastBackground('missing-node'), { wrapper });

    // result
    expect(result.current).toEqual({ color: '#123456' });
  });

  it('should return the page background color when no node id is given', () => {
    // mock
    store.dispatch(setBackgroundPaint({ color: '#abcdef', opacity: 100, type: 'solid' }));

    // before
    const { result } = renderHook(() => useContrastBackground(undefined), { wrapper });

    // result
    expect(result.current).toEqual({ color: '#abcdef' });
  });
});
