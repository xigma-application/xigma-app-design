import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useToggleExpandClick } from '../useToggleExpandClick';

describe('useToggleExpandClick', () => {
  it('should call onToggleExpand when invoked', () => {
    // mock
    const onToggleExpand = vi.fn();
    const stopPropagation = vi.fn();

    // before
    const { result } = renderHook(() => useToggleExpandClick(onToggleExpand));

    // action
    result.current({ stopPropagation } as unknown as MouseEvent<HTMLElement>);

    // result
    expect(onToggleExpand).toHaveBeenCalledTimes(1);
  });

  it('should stop the click from propagating, so it does not also select the row', () => {
    // mock
    const stopPropagation = vi.fn();

    // before
    const { result } = renderHook(() => useToggleExpandClick(vi.fn()));

    // action
    result.current({ stopPropagation } as unknown as MouseEvent<HTMLElement>);

    // result
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });
});
