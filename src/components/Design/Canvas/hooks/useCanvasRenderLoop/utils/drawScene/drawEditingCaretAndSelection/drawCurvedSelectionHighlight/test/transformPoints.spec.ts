// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { transformPoints } from '../transformPoints';

const BOX: TEditingTextBox = { flipX: false, flipY: false, height: 20, rotation: 0, width: 20, x: 0, y: 0 };
const CENTER = { x: 10, y: 10 };

describe('transformPoints', () => {
  it('should leave points unchanged for an unrotated, unflipped box', () => {
    // result
    expect(transformPoints([{ x: 5, y: 5 }], BOX, CENTER)).toEqual([{ x: 5, y: 5 }]);
  });

  it('should mirror points when the box is flipped horizontally', () => {
    // before
    const [point] = transformPoints([{ x: 5, y: 5 }], { ...BOX, flipX: true }, CENTER);

    // result — mirrored across the box's own x + width/2
    expect(point.x).toBeCloseTo(15);
    expect(point.y).toBeCloseTo(5);
  });

  it('should rotate points around the given center', () => {
    // before — 180 degrees around (10,10) maps (5,5) to (15,15)
    const [point] = transformPoints([{ x: 5, y: 5 }], { ...BOX, rotation: 180 }, CENTER);

    // result
    expect(point.x).toBeCloseTo(15);
    expect(point.y).toBeCloseTo(15);
  });
});
