// utils
import { createAltKeyPointerMoveEvent } from '../createAltKeyPointerMoveEvent';

describe('createAltKeyPointerMoveEvent', () => {
  it('should build a synthetic pointermove at the given position carrying the current Alt state', () => {
    // action
    const event = createAltKeyPointerMoveEvent({ x: 12, y: 34 }, new KeyboardEvent('keyup', { altKey: false }));

    // result
    expect(event.type).toBe('pointermove');
    expect(event.clientX).toBe(12);
    expect(event.clientY).toBe(34);
    expect(event.altKey).toBe(false);
    expect(event.pointerId).toBe(-1);
  });

  it('should carry a held Alt through as altKey true', () => {
    // action
    const event = createAltKeyPointerMoveEvent({ x: 0, y: 0 }, new KeyboardEvent('keydown', { altKey: true }));

    // result
    expect(event.altKey).toBe(true);
  });
});
