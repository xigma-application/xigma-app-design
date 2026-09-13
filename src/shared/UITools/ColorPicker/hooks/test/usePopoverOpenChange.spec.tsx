import { renderHook } from '@testing-library/react';

// hooks
import { usePopoverOpenChange } from '../usePopoverOpenChange';

describe('usePopoverOpenChange', () => {
  it('should close the sampler when the popover closes', () => {
    // mock
    const closeSampler = vi.fn();

    // before
    const { result } = renderHook(() => usePopoverOpenChange(closeSampler));

    // action
    result.current(false);

    // result
    expect(closeSampler).toHaveBeenCalledTimes(1);
  });

  it('should not close the sampler when the popover opens', () => {
    // mock
    const closeSampler = vi.fn();

    // before
    const { result } = renderHook(() => usePopoverOpenChange(closeSampler));

    // action
    result.current(true);

    // result
    expect(closeSampler).not.toHaveBeenCalled();
  });

  it('should still forward every open change to the caller-supplied onOpenChange', () => {
    // mock
    const closeSampler = vi.fn();
    const onOpenChange = vi.fn();

    // before
    const { result } = renderHook(() => usePopoverOpenChange(closeSampler, onOpenChange));

    // action
    result.current(true);
    result.current(false);

    // result
    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
  });

  it('should not throw when no onOpenChange is provided', () => {
    // before
    const { result } = renderHook(() => usePopoverOpenChange(vi.fn()));

    // action
    const trigger = (): void => result.current(false);

    // result
    expect(trigger).not.toThrow();
  });
});
