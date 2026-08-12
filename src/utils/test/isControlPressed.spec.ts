// utils
import { isControlPressed } from '../isControlPressed';

describe('isControlPressed', () => {
  it('should return true when ctrlKey is pressed', () => {
    // before
    const event = new WheelEvent('wheel', { ctrlKey: true });

    // result
    expect(isControlPressed(event)).toBe(true);
  });

  it('should return true when metaKey is pressed (Cmd on macOS)', () => {
    // before
    const event = new WheelEvent('wheel', { metaKey: true });

    // result
    expect(isControlPressed(event)).toBe(true);
  });

  it('should return false when neither ctrlKey nor metaKey is pressed', () => {
    // before
    const event = new WheelEvent('wheel', {});

    // result
    expect(isControlPressed(event)).toBe(false);
  });

  it('should work with any MouseEvent, e.g. a PointerEvent from a drag gesture', () => {
    // before
    const event = new PointerEvent('pointermove', { ctrlKey: true });

    // result
    expect(isControlPressed(event)).toBe(true);
  });
});
