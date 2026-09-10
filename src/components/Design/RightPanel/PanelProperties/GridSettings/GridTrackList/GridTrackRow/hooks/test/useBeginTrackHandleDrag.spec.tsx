import { PointerEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useBeginTrackHandleDrag } from '../useBeginTrackHandleDrag';

const createPointerEvent = (overrides: Partial<{ ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }> = {}): PointerEvent =>
  ({ ctrlKey: false, metaKey: false, shiftKey: false, ...overrides }) as PointerEvent;

describe('useBeginTrackHandleDrag', () => {
  it('should start a drag for a plain pointer down', () => {
    const onSelect = vi.fn();
    const onStartDrag = vi.fn();
    const { result } = renderHook(() => useBeginTrackHandleDrag(onSelect, onStartDrag));
    const event = createPointerEvent();

    result.current(event);

    expect(onStartDrag).toHaveBeenCalledWith(event);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should select instead of dragging when the meta key is held', () => {
    const onSelect = vi.fn();
    const onStartDrag = vi.fn();
    const { result } = renderHook(() => useBeginTrackHandleDrag(onSelect, onStartDrag));

    result.current(createPointerEvent({ metaKey: true }));

    expect(onSelect).toHaveBeenCalledWith({ meta: true, shift: false });
    expect(onStartDrag).not.toHaveBeenCalled();
  });

  it('should also select for a held ctrl key', () => {
    const onSelect = vi.fn();
    const onStartDrag = vi.fn();
    const { result } = renderHook(() => useBeginTrackHandleDrag(onSelect, onStartDrag));

    result.current(createPointerEvent({ ctrlKey: true }));

    expect(onSelect).toHaveBeenCalledWith({ meta: true, shift: false });
    expect(onStartDrag).not.toHaveBeenCalled();
  });

  it('should select a range instead of dragging when the shift key is held', () => {
    const onSelect = vi.fn();
    const onStartDrag = vi.fn();
    const { result } = renderHook(() => useBeginTrackHandleDrag(onSelect, onStartDrag));

    result.current(createPointerEvent({ shiftKey: true }));

    expect(onSelect).toHaveBeenCalledWith({ meta: false, shift: true });
    expect(onStartDrag).not.toHaveBeenCalled();
  });
});
