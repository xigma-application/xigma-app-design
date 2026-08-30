import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useCollapseButtonClick } from '../useCollapseButtonClick';

describe('useCollapseButtonClick', () => {
  it('should stop propagation and then call onCollapseAll', () => {
    // mock
    const onCollapseAll = vi.fn();
    const stopPropagation = vi.fn();

    // before
    const { result } = renderHook(() => useCollapseButtonClick(onCollapseAll));

    // action
    result.current({ stopPropagation } as unknown as MouseEvent<HTMLButtonElement>);

    // result
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onCollapseAll).toHaveBeenCalledTimes(1);
  });
});
