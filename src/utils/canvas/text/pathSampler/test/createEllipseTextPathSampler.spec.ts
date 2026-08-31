// utils
import { buildEllipseArcLengthTable } from '../../../shapes/buildEllipseArcLengthTable';
import { createEllipseTextPathSampler } from '../createEllipseTextPathSampler';
import { getEllipseCircumference } from '../../../shapes/getEllipseCircumference';
import { getEllipsePathSample } from '../../../shapes/getEllipsePathSample';
import { getNearestEllipsePathOffset } from '../../../shapes/getNearestEllipsePathOffset/getNearestEllipsePathOffset';

const BOX = { height: 200, rotation: 0, width: 200, x: 0, y: 0 };

describe('createEllipseTextPathSampler', () => {
  it('should report isClosed true', () => {
    // result
    expect(createEllipseTextPathSampler(BOX).isClosed).toBe(true);
  });

  it('should report no corner lengths — an ellipse has no sharp vertices to fold a join at', () => {
    // result
    expect(createEllipseTextPathSampler(BOX).cornerLengths).toEqual([]);
  });

  it('should report the same totalLength as getEllipseCircumference', () => {
    // mock
    const table = buildEllipseArcLengthTable(BOX.width, BOX.height);

    // result
    expect(createEllipseTextPathSampler(BOX).totalLength).toBeCloseTo(getEllipseCircumference(table));
  });

  it('should delegate sampleAtLength to getEllipsePathSample, unchanged', () => {
    // mock
    const table = buildEllipseArcLengthTable(BOX.width, BOX.height);
    const expected = getEllipsePathSample(BOX.width, BOX.height, table, 42);

    // result
    expect(createEllipseTextPathSampler(BOX).sampleAtLength(42)).toEqual(expected);
  });

  it('should delegate nearestOffsetAtPoint to getNearestEllipsePathOffset with rotation stripped, unchanged', () => {
    // mock
    const table = buildEllipseArcLengthTable(BOX.width, BOX.height);
    const point = { x: 50, y: 30 };
    const expected = getNearestEllipsePathOffset(point, { ...BOX, rotation: 0 }, table);

    // result
    expect(createEllipseTextPathSampler(BOX).nearestOffsetAtPoint(point)).toEqual(expected);
  });

  it('should reuse a cached arc-length table when a shared cache is passed', () => {
    // mock
    const cache = new Map();

    // before
    createEllipseTextPathSampler(BOX, cache);
    createEllipseTextPathSampler(BOX, cache);

    // result — one table built for the "200:200" key, reused on the second call
    expect(cache.size).toBe(1);
  });
});
