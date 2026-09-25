// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getSpacingGroups } from '../getSpacingGroups';

const makeRectangle = (id: string, x: number, y: number, size = 20): TRectangleNode => ({
  fills: [],
  height: size,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: size,
  x,
  y,
});

describe('getSpacingGroups', () => {
  it('should keep the overlap groups when the layers are apart', () => {
    // mock
    const items = [makeRectangle('b', 60, 0), makeRectangle('a', 0, 0)];

    // result
    expect(getSpacingGroups(items, 'horizontal').map((group) => group.map((node) => node.id))).toEqual([['a'], ['b']]);
  });

  it('should split fully overlapping layers into single-layer groups by start', () => {
    // mock
    const items = [makeRectangle('b', 10, 0), makeRectangle('a', 0, 0)];

    // result
    expect(getSpacingGroups(items, 'horizontal').map((group) => group.map((node) => node.id))).toEqual([['a'], ['b']]);
  });
});
