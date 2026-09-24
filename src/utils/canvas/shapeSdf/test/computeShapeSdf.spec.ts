// utils
import { computeShapeSdf } from '../computeShapeSdf';

const square = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const sampleAt = (sdf: ReturnType<typeof computeShapeSdf>, x: number, y: number): number => {
  const column = Math.floor((x - sdf.origin.x) / sdf.cellSize);
  const row = Math.floor((y - sdf.origin.y) / sdf.cellSize);

  return sdf.values[row * sdf.width + column];
};

describe('computeShapeSdf', () => {
  it('should cover the shape bounds plus padding', () => {
    // action
    const sdf = computeShapeSdf([square], { height: 100, width: 100, x: 0, y: 0 });

    // result
    expect(sdf.origin).toEqual({ x: -8, y: -8 });
    expect(sdf.width * sdf.cellSize).toBeGreaterThanOrEqual(116);
  });

  it('should be negative inside, positive outside and near zero on the edge', () => {
    // action
    const sdf = computeShapeSdf([square], { height: 100, width: 100, x: 0, y: 0 });

    // result
    expect(sampleAt(sdf, 50, 50)).toBeCloseTo(-50, 0);
    expect(sampleAt(sdf, -5, 50)).toBeGreaterThan(0);
    expect(Math.abs(sampleAt(sdf, 0.1, 50))).toBeLessThan(1);
  });

  it('should treat a nested polygon as a hole', () => {
    // mock
    const hole = [
      { x: 30, y: 30 },
      { x: 70, y: 30 },
      { x: 70, y: 70 },
      { x: 30, y: 70 },
    ];

    // action
    const sdf = computeShapeSdf([square, hole], { height: 100, width: 100, x: 0, y: 0 });

    // result
    expect(sampleAt(sdf, 50, 50)).toBeGreaterThan(0);
    expect(sampleAt(sdf, 15, 50)).toBeLessThan(0);
  });
});
