// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TPolygonNode } from 'types/design/types';

// utils
import { getOffsetVectorSourceOutline } from '../getOffsetVectorSourceOutline';

const line: TLineNode = {
  height: 0,
  id: 'line',
  name: 'Line',
  parentId: null,
  rotation: 0,
  strokes: [],
  type: NodeType.line,
  width: 100,
  x: 0,
  y: 0,
};

describe('getOffsetVectorSourceOutline', () => {
  it('should give the open segment of a line', () => {
    // result
    expect(getOffsetVectorSourceOutline(line)).toEqual({
      closed: false,
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    });
  });

  it('should give the closed outline of a polygon', () => {
    // mock
    const polygon: TPolygonNode = { ...line, fills: [], flipX: false, flipY: false, height: 100, sides: 3, type: NodeType.polygon };

    // before
    const outline = getOffsetVectorSourceOutline(polygon);

    // result
    expect(outline.closed).toBe(true);
    expect(outline.points).toHaveLength(3);
  });
});
