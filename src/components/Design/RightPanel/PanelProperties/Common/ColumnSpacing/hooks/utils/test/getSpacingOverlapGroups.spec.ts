// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getSpacingOverlapGroups } from '../getSpacingOverlapGroups';

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

describe('getSpacingOverlapGroups', () => {
  it('should group layers whose spans overlap on the axis, in position order', () => {
    // mock
    const items = [makeRectangle('c', 100, 0), makeRectangle('a', 0, 0), makeRectangle('b', 10, 40)];

    // before
    const groups = getSpacingOverlapGroups(items, 'horizontal');

    // result
    expect(groups.map((group) => group.map((node) => node.id))).toEqual([['a', 'b'], ['c']]);
  });

  it('should return no groups for no layers', () => {
    // result
    expect(getSpacingOverlapGroups([], 'vertical')).toEqual([]);
  });
});
