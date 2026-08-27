import { act, renderHook } from '@testing-library/react';

// hooks
import { useColorSampler } from '../useColorSampler';

describe('useColorSampler', () => {
  it('should start inactive', () => {
    // before
    const { result } = renderHook(() => useColorSampler(vi.fn()));

    // result
    expect(result.current.isActive).toBe(false);
  });

  it('should become active when opened', () => {
    // before
    const { result } = renderHook(() => useColorSampler(vi.fn()));

    // action
    act(() => result.current.open());

    // result
    expect(result.current.isActive).toBe(true);
  });

  it('should become inactive when closed', () => {
    // before
    const { result } = renderHook(() => useColorSampler(vi.fn()));

    act(() => result.current.open());

    // action
    act(() => result.current.close());

    // result
    expect(result.current.isActive).toBe(false);
  });

  it('should apply the picked hex and close on pick', () => {
    // mock
    const setHex = vi.fn();

    // before
    const { result } = renderHook(() => useColorSampler(setHex));

    act(() => result.current.open());

    // action
    act(() => result.current.pick('#ff00ff'));

    // result
    expect(setHex).toHaveBeenCalledWith('#ff00ff');
    expect(result.current.isActive).toBe(false);
  });
});
