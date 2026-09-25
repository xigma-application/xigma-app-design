// utils
import { getLineShape } from '../getLineShape';

const polygon = [
  { x: 0, y: -1 },
  { x: 10, y: -1 },
  { x: 10, y: 1 },
  { x: 0, y: 1 },
];

describe('getLineShape', () => {
  it('should wrap the line outline in an effect shape with its bounds', () => {
    // before
    const shape = getLineShape(polygon);

    // result
    expect(shape.bounds).toEqual({ height: 2, width: 10, x: 0, y: -1 });
    expect(shape.polygons).toEqual([polygon]);
  });

  it('should reuse the shape for the same outline', () => {
    // result
    expect(getLineShape(polygon)).toBe(getLineShape(polygon));
  });

  it('should give a new outline a new key', () => {
    // result
    expect(getLineShape([...polygon]).key).not.toBe(getLineShape([...polygon]).key);
  });
});
