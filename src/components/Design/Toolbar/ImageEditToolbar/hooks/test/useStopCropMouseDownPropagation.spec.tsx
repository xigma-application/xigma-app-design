import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useStopCropMouseDownPropagation } from '../useStopCropMouseDownPropagation';

describe('useStopCropMouseDownPropagation', () => {
  it('should stop the mousedown from propagating', () => {
    // mock
    const stopPropagation = vi.fn();
    const { result } = renderHook(() => useStopCropMouseDownPropagation());

    // action
    result.current({ stopPropagation } as unknown as MouseEvent);

    // result
    expect(stopPropagation).toHaveBeenCalled();
  });
});
