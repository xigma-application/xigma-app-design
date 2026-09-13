import { renderHook } from '@testing-library/react';

// hooks
import { useOpenSessionId } from '../useOpenSessionId';

describe('useOpenSessionId', () => {
  it('should start at 0 when initially closed', () => {
    // before
    const { result } = renderHook(({ isOpen }: { isOpen: boolean }) => useOpenSessionId(isOpen), {
      initialProps: { isOpen: false },
    });

    // result
    expect(result.current).toBe(0);
  });

  it('should start at 0 when initially open too, since there is no prior closed state to transition from', () => {
    // before
    const { result } = renderHook(({ isOpen }: { isOpen: boolean }) => useOpenSessionId(isOpen), {
      initialProps: { isOpen: true },
    });

    // result
    expect(result.current).toBe(0);
  });

  it('should bump the session id on every closed-to-open transition', () => {
    // before
    const { rerender, result } = renderHook(({ isOpen }: { isOpen: boolean }) => useOpenSessionId(isOpen), {
      initialProps: { isOpen: false },
    });

    // action
    rerender({ isOpen: true });

    // result
    expect(result.current).toBe(1);

    // action
    rerender({ isOpen: false });

    // result — closing does not bump it
    expect(result.current).toBe(1);

    // action
    rerender({ isOpen: true });

    // result — a second open transition bumps it again
    expect(result.current).toBe(2);
  });

  it('should not bump the session id on a re-render that keeps isOpen true', () => {
    // before
    const { rerender, result } = renderHook(({ isOpen }: { isOpen: boolean }) => useOpenSessionId(isOpen), {
      initialProps: { isOpen: true },
    });

    // action
    rerender({ isOpen: true });

    // result
    expect(result.current).toBe(0);
  });
});
