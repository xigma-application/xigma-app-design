import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useStopClickPropagation } from './useStopClickPropagation';

describe('useStopClickPropagation', () => {
  it('should stop propagation of the given event', () => {
    // mock
    const stopPropagation = vi.fn();

    // before
    const { result } = renderHook(() => useStopClickPropagation());

    // action
    result.current({ stopPropagation } as unknown as MouseEvent);

    // result
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });
});
