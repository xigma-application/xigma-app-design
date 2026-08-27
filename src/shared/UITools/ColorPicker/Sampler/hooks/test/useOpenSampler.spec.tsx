import { renderHook } from '@testing-library/react';

// hooks
import { useOpenSampler } from '../useOpenSampler';

describe('useOpenSampler', () => {
  it('should call onClick when the trigger opens', () => {
    // mock
    const onClick = vi.fn();

    // before
    const { result } = renderHook(() => useOpenSampler(onClick));

    // action
    result.current(true);

    // result
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when the trigger closes', () => {
    // mock
    const onClick = vi.fn();

    // before
    const { result } = renderHook(() => useOpenSampler(onClick));

    // action
    result.current(false);

    // result
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should not throw when no onClick is provided', () => {
    // before
    const { result } = renderHook(() => useOpenSampler());

    // action
    const trigger = (): void => result.current(true);

    // result
    expect(trigger).not.toThrow();
  });
});
