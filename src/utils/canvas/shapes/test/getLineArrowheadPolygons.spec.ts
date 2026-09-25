// types
import { NodeType } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

// utils
import { getLineArrowheadPolygons } from '../getLineArrowheadPolygons';

const line: TLineNode = { id: 'line', name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1: 0, x2: 100, y1: 0, y2: 0 };

describe('getLineArrowheadPolygons', () => {
  it('should return no polygons for a line without arrows', () => {
    // result
    expect(getLineArrowheadPolygons(line)).toEqual([]);
  });

  it('should return the two wings and three joints of an arrowhead at the end', () => {
    // before
    const polygons = getLineArrowheadPolygons({ ...line, endPoint: 'arrow' });

    // result
    expect(polygons).toHaveLength(5);
    expect(polygons.flat().every((point) => point.x > 90)).toBe(true);
  });

  it('should put an arrowhead at the start pointing back along the line', () => {
    // before
    const polygons = getLineArrowheadPolygons({ ...line, startPoint: 'arrow' });

    // result
    expect(polygons).toHaveLength(5);
    expect(polygons.flat().every((point) => point.x < 10)).toBe(true);
  });

  it('should return no polygons for a zero-length line', () => {
    // result
    expect(getLineArrowheadPolygons({ ...line, endPoint: 'arrow', x2: 0 })).toEqual([]);
  });
});
