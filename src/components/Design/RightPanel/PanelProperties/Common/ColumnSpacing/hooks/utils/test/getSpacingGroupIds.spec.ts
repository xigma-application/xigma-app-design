// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getSpacingGroupIds } from '../getSpacingGroupIds';

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

describe('getSpacingGroupIds', () => {
  it('should map the spacing groups to their ids', () => {
    // mock
    const items = [makeRectangle('b', 0, 60), makeRectangle('a', 0, 0)];

    // result
    expect(getSpacingGroupIds(items, 'vertical')).toEqual([['a'], ['b']]);
  });
});
