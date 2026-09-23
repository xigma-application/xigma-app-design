import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useStopSectionActionsPropagation } from '../useStopSectionActionsPropagation';

describe('useStopSectionActionsPropagation', () => {
  it('should stop propagation on the given event', () => {
    // before
    const { result } = renderHook(() => useStopSectionActionsPropagation());
    const stopPropagation = vi.fn();

    // action
    result.current({ stopPropagation } as unknown as MouseEvent<HTMLElement>);

    // result
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });
});
