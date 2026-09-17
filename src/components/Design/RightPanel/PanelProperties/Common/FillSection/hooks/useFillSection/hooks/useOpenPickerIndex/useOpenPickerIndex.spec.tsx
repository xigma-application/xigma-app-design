import { act, renderHook } from '@testing-library/react';

// hooks
import { useOpenPickerIndex } from './useOpenPickerIndex';

describe('useOpenPickerIndex', () => {
  it('should start with no open picker when no initial index is given', () => {
    // before
    const { result } = renderHook(() => useOpenPickerIndex('node-1', null));

    // result
    expect(result.current.openPickerIndex).toBeNull();
  });

  it('should seed the open index from the initial value on mount (resuming a fill-picker focus)', () => {
    // before
    const { result } = renderHook(() => useOpenPickerIndex('node-1', 2));

    // result
    expect(result.current.openPickerIndex).toBe(2);
  });

  it('should record which index opened its picker', () => {
    // before
    const { result } = renderHook(() => useOpenPickerIndex('node-1', null));

    // action
    act(() => result.current.onPickerOpenChange(2, true));

    // result
    expect(result.current.openPickerIndex).toBe(2);
  });

  it('should switch the open index when a different row opens, without needing an explicit close first', () => {
    // before
    const { result } = renderHook(() => useOpenPickerIndex('node-1', null));

    act(() => result.current.onPickerOpenChange(0, true));

    // action
    act(() => result.current.onPickerOpenChange(1, true));

    // result
    expect(result.current.openPickerIndex).toBe(1);
  });

  it('should clear the open index when the current owner closes', () => {
    // before
    const { result } = renderHook(() => useOpenPickerIndex('node-1', null));

    act(() => result.current.onPickerOpenChange(1, true));

    // action
    act(() => result.current.onPickerOpenChange(1, false));

    // result
    expect(result.current.openPickerIndex).toBeNull();
  });

  it('should ignore a stale close from a row that is no longer the owner', () => {
    // before
    const { result } = renderHook(() => useOpenPickerIndex('node-1', null));

    act(() => result.current.onPickerOpenChange(0, true));
    act(() => result.current.onPickerOpenChange(1, true));

    // action — fill 0's own close arrives late, after fill 1 already took over
    act(() => result.current.onPickerOpenChange(0, false));

    // result
    expect(result.current.openPickerIndex).toBe(1);
  });

  it('should reset the open index when the selected node changes', () => {
    // before
    const { rerender, result } = renderHook(({ nodeId }) => useOpenPickerIndex(nodeId, null), { initialProps: { nodeId: 'node-1' } });

    act(() => result.current.onPickerOpenChange(0, true));

    // action
    rerender({ nodeId: 'node-2' });

    // result
    expect(result.current.openPickerIndex).toBeNull();
  });
});
