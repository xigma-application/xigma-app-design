// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getSpacingCenterSpread } from '../getSpacingCenterSpread';

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

describe('getSpacingCenterSpread', () => {
  it('should measure the distance between the outermost centers on the axis', () => {
    // mock
    const items = [makeRectangle('a', 0, 0), makeRectangle('b', 50, 10), makeRectangle('c', 20, 30, 40)];

    // result
    expect(getSpacingCenterSpread(items, 'horizontal')).toBe(50);
    expect(getSpacingCenterSpread(items, 'vertical')).toBe(40);
  });
});
