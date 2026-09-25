// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode, TStarNode } from 'types/design/types';

// utils
import { getShapeCount } from '../getShapeCount';

describe('getShapeCount', () => {
  it('should read the sides of a polygon and the points of a star', () => {
    // result
    expect(getShapeCount({ sides: 6, type: NodeType.polygon } as TPolygonNode)).toBe(6);
    expect(getShapeCount({ points: 7, type: NodeType.star } as TStarNode)).toBe(7);
  });
});
