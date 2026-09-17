import { renderHook } from '@testing-library/react';

// hooks
import { useForceClosePicker } from '../useForceClosePicker';

describe('useForceClosePicker', () => {
  it('should not close on initial mount when no signal is provided', () => {
    // mock
    const setIsOpen = vi.fn();

    // before
    renderHook(() => useForceClosePicker(undefined, setIsOpen));

    // result
    expect(setIsOpen).not.toHaveBeenCalled();
  });

  it('should not close when the signal stays undefined across rerenders', () => {
    // mock
    const setIsOpen = vi.fn();

    // before
    const { rerender } = renderHook(({ signal }) => useForceClosePicker(signal, setIsOpen), {
      initialProps: { signal: undefined as number | undefined },
    });

    // action
    rerender({ signal: undefined });

    // result
    expect(setIsOpen).not.toHaveBeenCalled();
  });

  it('should close once the signal transitions from undefined to a defined value', () => {
    // mock
    const setIsOpen = vi.fn();

    // before
    const { rerender } = renderHook(({ signal }) => useForceClosePicker(signal, setIsOpen), {
      initialProps: { signal: undefined as number | undefined },
    });

    // action
    rerender({ signal: 1 });

    // result
    expect(setIsOpen).toHaveBeenCalledTimes(1);
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it('should close again on every subsequent change of the signal', () => {
    // mock
    const setIsOpen = vi.fn();

    // before — the initial mount itself closes once, since the signal already starts defined
    const { rerender } = renderHook(({ signal }) => useForceClosePicker(signal, setIsOpen), {
      initialProps: { signal: 1 },
    });

    setIsOpen.mockClear();

    // action
    rerender({ signal: 2 });

    // result
    expect(setIsOpen).toHaveBeenCalledTimes(1);
  });
});
