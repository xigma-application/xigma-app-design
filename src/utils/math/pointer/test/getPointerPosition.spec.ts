// utils
import { getPointerPosition } from '../getPointerPosition';

describe('getPointerPosition', () => {
  it('should return the pointer position relative to the canvas', () => {
    // mock
    const canvas = document.createElement('canvas');

    // spy
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 10, top: 20 } as DOMRect);

    // before
    const event = new PointerEvent('pointerdown', { clientX: 50, clientY: 70 });

    // result
    expect(getPointerPosition(canvas, event)).toEqual({ x: 40, y: 50 });
  });
});
