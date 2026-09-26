// utils
import { getVectorCornerArc } from '../getVectorCornerArc';

const HANDLE = (4 / 3) * Math.tan(Math.PI / 8);

describe('getVectorCornerArc', () => {
  it('should cut a right angle at the radius and bend a quarter circle between the cuts', () => {
    // before
    const arc = getVectorCornerArc({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }, 10);

    // result
    expect(arc?.start.x).toBeCloseTo(10);
    expect(arc?.start.y).toBeCloseTo(0);
    expect(arc?.end.x).toBeCloseTo(0);
    expect(arc?.end.y).toBeCloseTo(10);
    expect(arc?.tangentStart?.x).toBeCloseTo(-10 * HANDLE);
    expect(arc?.tangentEnd?.y).toBeCloseTo(-10 * HANDLE);
  });

  it('should stop growing at half of the shorter segment', () => {
    // result
    expect(getVectorCornerArc({ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 0, y: 100 }, 50)?.start.x).toBeCloseTo(4);
  });

  it('should leave a straight run and a fold back sharp', () => {
    // result
    expect(getVectorCornerArc({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: -10, y: 0 }, 5)).toBeNull();
    expect(getVectorCornerArc({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }, 5)).toBeNull();
  });
});
