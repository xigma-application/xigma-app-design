import { KeyboardEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useBlockShortcutPropagation } from '../useBlockShortcutPropagation';

describe('useBlockShortcutPropagation behaviors', () => {
  it('should stop the event from propagating', () => {
    // mock
    const stopPropagation = vi.fn();
    const event = { stopPropagation } as unknown as KeyboardEvent<HTMLDivElement>;

    // before
    const { result } = renderHook(() => useBlockShortcutPropagation());

    // action
    result.current(event);

    // result
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });
});
