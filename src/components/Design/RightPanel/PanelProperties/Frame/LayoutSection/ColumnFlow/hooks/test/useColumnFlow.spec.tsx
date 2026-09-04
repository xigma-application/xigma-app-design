import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnFlow } from '../useColumnFlow';

describe('useColumnFlow', () => {
  it('should default to the "freeForm" value', () => {
    // before
    const { result } = renderHook(() => useColumnFlow());

    // result
    expect(result.current.value).toBe('freeForm');
  });

  it('should expose one toggle button per flow option', () => {
    // before
    const { result } = renderHook(() => useColumnFlow());

    // result
    expect(result.current.toggleButtons.map((button) => button.value)).toEqual(['freeForm', 'vertical', 'horizontal', 'grid']);
  });

  it('should update the value on change', () => {
    // before
    const { result } = renderHook(() => useColumnFlow());

    // action
    act(() => result.current.onChange('grid'));

    // result
    expect(result.current.value).toBe('grid');
  });
});
