// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getTidyUpRect } from '../getTidyUpRect';

describe('getTidyUpRect', () => {
  it('should round the node bounds', () => {
    // mock
    const node = {
      fills: [],
      height: 20.6,
      id: 'a',
      name: 'a',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10.4,
      x: 1.5,
      y: 2.2,
    } as TRectangleNode;

    // result
    expect(getTidyUpRect(node)).toEqual({ height: 21, width: 10, x: 2, y: 2 });
  });
});
