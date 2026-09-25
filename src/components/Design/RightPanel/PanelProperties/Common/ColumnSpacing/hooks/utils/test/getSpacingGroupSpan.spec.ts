// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getSpacingGroupSpan } from '../getSpacingGroupSpan';

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

describe('getSpacingGroupSpan', () => {
  it('should span from the lowest start to the highest end of the group', () => {
    // mock
    const group = [makeRectangle('a', 10, 0), makeRectangle('b', 0, 50, 5)];

    // result
    expect(getSpacingGroupSpan(group, 'horizontal')).toEqual({ end: 30, start: 0 });
    expect(getSpacingGroupSpan(group, 'vertical')).toEqual({ end: 55, start: 0 });
  });
});
