// utils
import { getAutoLayoutRotatedSlotPosition } from '../getAutoLayoutRotatedSlotPosition';

describe('getAutoLayoutRotatedSlotPosition', () => {
  it('should leave the slot untouched when the frame has no rotation', () => {
    // action
    const position = getAutoLayoutRotatedSlotPosition({ x: 10, y: 20 }, { height: 30, width: 40 }, { x: 100, y: 100 }, 0);

    // result
    expect(position).toEqual({ x: 10, y: 20 });
  });

  it('should orbit the slot’s own centre around the frame’s centre by the frame’s rotation', () => {
    // mock — a 20x20 slot sitting flush against the frame's centre on the right (centre at 110,100),
    // frame centre at (100,100); rotating 90deg should swing that slot centre from the right of the
    // frame centre to directly below it
    const slotTopLeft = { x: 100, y: 90 };
    const slotSize = { height: 20, width: 20 };
    const frameCenter = { x: 100, y: 100 };

    // action
    const position = getAutoLayoutRotatedSlotPosition(slotTopLeft, slotSize, frameCenter, 90);

    // result — new centre (100, 110), so top-left is centre minus half the size
    expect(position.x).toBeCloseTo(90, 5);
    expect(position.y).toBeCloseTo(100, 5);
  });
});
