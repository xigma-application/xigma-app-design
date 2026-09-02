// utils
import { getPointToPointGuides } from '../getPointToPointGuides';

describe('getPointToPointGuides', () => {
  it('should return nothing for two coincident points', () => {
    expect(getPointToPointGuides({ x: 10, y: 10 }, { x: 10, y: 10 })).toEqual({ labels: [], lines: [] });
  });

  it('should return a single solid run + label when the points share a row', () => {
    expect(getPointToPointGuides({ x: 0, y: 0 }, { x: 50, y: 0 })).toEqual({
      labels: [{ anchor: { x: 25, y: 0 }, offsetDirection: { x: 0, y: -1 }, text: '50' }],
      lines: [{ dashed: false, x1: 0, x2: 50, y1: 0, y2: 0 }],
    });
  });

  it('should return a single solid run + label when the points share a column', () => {
    expect(getPointToPointGuides({ x: 0, y: 0 }, { x: 0, y: 30 })).toEqual({
      labels: [{ anchor: { x: 0, y: 15 }, offsetDirection: { x: 1, y: 0 }, text: '30' }],
      lines: [{ dashed: false, x1: 0, x2: 0, y1: 0, y2: 30 }],
    });
  });

  it('should return an L-bracket of the horizontal then vertical leg for a diagonal gap', () => {
    expect(getPointToPointGuides({ x: 0, y: 0 }, { x: 30, y: 40 })).toEqual({
      labels: [
        { anchor: { x: 15, y: 0 }, offsetDirection: { x: 0, y: -1 }, text: '30' },
        { anchor: { x: 30, y: 20 }, offsetDirection: { x: 1, y: 0 }, text: '40' },
      ],
      lines: [
        { dashed: false, x1: 0, x2: 30, y1: 0, y2: 0 },
        { dashed: false, x1: 30, x2: 30, y1: 0, y2: 40 },
      ],
    });
  });
});
