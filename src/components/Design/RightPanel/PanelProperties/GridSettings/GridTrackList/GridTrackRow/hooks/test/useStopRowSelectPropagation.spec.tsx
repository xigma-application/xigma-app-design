import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useStopRowSelectPropagation } from '../useStopRowSelectPropagation';

describe('useStopRowSelectPropagation', () => {
  it('should stop the click from propagating', () => {
    // mock
    const stopPropagation = vi.fn();
    const { result } = renderHook(() => useStopRowSelectPropagation());

    // action
    result.current({ stopPropagation } as unknown as MouseEvent);

    // result
    expect(stopPropagation).toHaveBeenCalled();
  });
});
