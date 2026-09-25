import { FC, ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useTreeVisibleOrder } from '../useTreeVisibleOrder';

// others
import { TreeVisibleOrderContext } from '../context';

describe('useTreeVisibleOrder', () => {
  it('should read an empty order without a provider', () => {
    // before
    const { result } = renderHook(() => useTreeVisibleOrder());

    // result
    expect(result.current).toEqual([]);
  });

  it('should read the order provided by the tree', () => {
    // mock
    const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
      <TreeVisibleOrderContext.Provider value={['a', 'b']}>{children}</TreeVisibleOrderContext.Provider>
    );

    // before
    const { result } = renderHook(() => useTreeVisibleOrder(), { wrapper });

    // result
    expect(result.current).toEqual(['a', 'b']);
  });
});
