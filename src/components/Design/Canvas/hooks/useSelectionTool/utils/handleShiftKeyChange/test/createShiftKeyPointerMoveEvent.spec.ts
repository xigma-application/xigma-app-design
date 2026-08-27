// utils
import { createShiftKeyPointerMoveEvent } from '../createShiftKeyPointerMoveEvent';

describe('createShiftKeyPointerMoveEvent', () => {
  it('should build a synthetic pointermove event at the given position, carrying the key event’s shiftKey state', () => {
    // result
    const event = createShiftKeyPointerMoveEvent({ x: 10, y: 20 }, new KeyboardEvent('keydown', { shiftKey: true }));

    expect(event.type).toBe('pointermove');
    expect(event.clientX).toBe(10);
    expect(event.clientY).toBe(20);
    expect(event.pointerId).toBe(-1);
    expect(event.shiftKey).toBe(true);
  });

  it('should carry shiftKey: false when the key event reports Shift released', () => {
    // result
    const event = createShiftKeyPointerMoveEvent({ x: 0, y: 0 }, new KeyboardEvent('keyup', { shiftKey: false }));

    expect(event.shiftKey).toBe(false);
  });
});
