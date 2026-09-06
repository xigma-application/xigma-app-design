// utils
import { createModifierKeyPointerMoveEvent } from '../createModifierKeyPointerMoveEvent';

describe('createModifierKeyPointerMoveEvent', () => {
  it('should build a synthetic pointermove at the given position, carrying the key event’s ctrl/meta/shift state', () => {
    // result
    const event = createModifierKeyPointerMoveEvent(
      { x: 10, y: 20 },
      new KeyboardEvent('keydown', { ctrlKey: true, metaKey: true, shiftKey: true }),
    );

    expect(event.type).toBe('pointermove');
    expect(event.clientX).toBe(10);
    expect(event.clientY).toBe(20);
    expect(event.pointerId).toBe(-1);
    expect(event.ctrlKey).toBe(true);
    expect(event.metaKey).toBe(true);
    expect(event.shiftKey).toBe(true);
  });

  it('should carry the released state when the key event reports the modifiers up', () => {
    // result
    const event = createModifierKeyPointerMoveEvent(
      { x: 0, y: 0 },
      new KeyboardEvent('keyup', { ctrlKey: false, metaKey: false, shiftKey: false }),
    );

    expect(event.ctrlKey).toBe(false);
    expect(event.metaKey).toBe(false);
    expect(event.shiftKey).toBe(false);
  });
});
