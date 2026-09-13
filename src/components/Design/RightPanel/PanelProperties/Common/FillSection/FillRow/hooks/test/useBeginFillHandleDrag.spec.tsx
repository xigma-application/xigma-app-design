import { PointerEvent as ReactPointerEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useBeginFillHandleDrag } from '../useBeginFillHandleDrag';

describe('useBeginFillHandleDrag behaviors', () => {
  it('should call onSelect instead of onStartDrag when shiftKey is held', () => {
    // mock
    const onSelect = vi.fn();
    const onStartDrag = vi.fn();
    const event = { ctrlKey: false, metaKey: false, shiftKey: true } as unknown as ReactPointerEvent;

    // before
    const { result } = renderHook(() => useBeginFillHandleDrag(onSelect, onStartDrag));

    // action
    result.current(event);

    // result
    expect(onSelect).toHaveBeenCalledWith({ meta: false, shift: true });
    expect(onStartDrag).not.toHaveBeenCalled();
  });

  it('should call onSelect instead of onStartDrag when metaKey or ctrlKey is held', () => {
    // mock
    const onSelect = vi.fn();
    const onStartDrag = vi.fn();
    const event = { ctrlKey: true, metaKey: false, shiftKey: false } as unknown as ReactPointerEvent;

    // before
    const { result } = renderHook(() => useBeginFillHandleDrag(onSelect, onStartDrag));

    // action
    result.current(event);

    // result
    expect(onSelect).toHaveBeenCalledWith({ meta: true, shift: false });
    expect(onStartDrag).not.toHaveBeenCalled();
  });

  it('should call onStartDrag when no modifier key is held', () => {
    // mock
    const onSelect = vi.fn();
    const onStartDrag = vi.fn();
    const event = { ctrlKey: false, metaKey: false, shiftKey: false } as unknown as ReactPointerEvent;

    // before
    const { result } = renderHook(() => useBeginFillHandleDrag(onSelect, onStartDrag));

    // action
    result.current(event);

    // result
    expect(onStartDrag).toHaveBeenCalledWith(event);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
