// types
import { StrokeAlign } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getAlignedStrokeBand } from '../getAlignedStrokeBand';

const square: TPoint[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const getXRange = (polygons: TPoint[][]): [number, number] => {
  const xs = polygons.flat().map(({ x }) => x);
  return [Math.min(...xs), Math.max(...xs)];
};

describe('getAlignedStrokeBand', () => {
  it('should keep the shape edge and an inner edge for an inside stroke', () => {
    // before
    const band = getAlignedStrokeBand(square, false, StrokeAlign.inside, 10);

    // result
    expect(band[0]).toBe(square);
    expect(getXRange([band[1]])).toEqual([10, 90]);
  });

  it('should grow a hole for an inside stroke', () => {
    // before
    const band = getAlignedStrokeBand(square, true, StrokeAlign.inside, 10);

    // result
    expect(getXRange(band)).toEqual([-10, 110]);
  });

  it('should drop an edge that collapses', () => {
    // before
    const band = getAlignedStrokeBand(square, false, StrokeAlign.inside, 80);

    // result
    expect(band).toEqual([square]);
  });
});
