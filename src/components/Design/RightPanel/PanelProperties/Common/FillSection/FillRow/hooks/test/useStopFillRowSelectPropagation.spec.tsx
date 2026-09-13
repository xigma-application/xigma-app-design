import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useStopFillRowSelectPropagation } from '../useStopFillRowSelectPropagation';

describe('useStopFillRowSelectPropagation behaviors', () => {
  it('should call stopPropagation on the event', () => {
    // mock
    const event = { stopPropagation: vi.fn() } as unknown as MouseEvent;

    // before
    const { result } = renderHook(() => useStopFillRowSelectPropagation());

    // action
    result.current(event);

    // result
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});
