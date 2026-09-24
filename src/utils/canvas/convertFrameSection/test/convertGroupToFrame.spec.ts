// types
import { NodeType } from 'types/design/enums';
import { TGroupNode } from 'types/design/types';

// utils
import { convertGroupToFrame } from '../convertGroupToFrame';

const group: TGroupNode = {
  childIds: ['a'],
  height: 100,
  hidden: true,
  id: 'group-1',
  locked: true,
  name: 'Group',
  parentId: 'parent-1',
  rotation: 0,
  type: NodeType.group,
  width: 200,
  x: 10,
  y: 20,
};

describe('convertGroupToFrame', () => {
  it('should keep the id, children, box and flags, with no fill and no clipping so the look does not change', () => {
    expect(convertGroupToFrame(group)).toEqual({
      childIds: ['a'],
      clipContent: false,
      fills: [],
      height: 100,
      hidden: true,
      id: 'group-1',
      locked: true,
      name: 'Group',
      parentId: 'parent-1',
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 10,
      y: 20,
    });
  });
});
