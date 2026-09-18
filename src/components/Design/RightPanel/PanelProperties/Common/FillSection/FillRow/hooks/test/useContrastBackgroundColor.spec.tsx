import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useContrastBackgroundColor } from '../useContrastBackgroundColor';

// store
import { setBackgroundPaint } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useContrastBackgroundColor', () => {
  afterEach(() => {
    store.dispatch(setBackgroundPaint({ color: '#ffffff', opacity: 100, type: 'solid' }));
  });

  it('should return the page background color when the node is unknown', () => {
    // mock
    store.dispatch(setBackgroundPaint({ color: '#123456', opacity: 100, type: 'solid' }));

    // before
    const { result } = renderHook(() => useContrastBackgroundColor('missing-node'), { wrapper });

    // result
    expect(result.current).toBe('#123456');
  });

  it('should return the page background color when no node id is given', () => {
    // mock
    store.dispatch(setBackgroundPaint({ color: '#abcdef', opacity: 100, type: 'solid' }));

    // before
    const { result } = renderHook(() => useContrastBackgroundColor(undefined), { wrapper });

    // result
    expect(result.current).toBe('#abcdef');
  });
});
