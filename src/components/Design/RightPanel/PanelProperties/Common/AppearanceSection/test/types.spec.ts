// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TRectangleNode } from 'types/design/types';
import { isAppearanceNode } from '../types';

const rectangle: TRectangleNode = {
  fill: '#fff',
  height: 10,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};

const group: TGroupNode = {
  childIds: [],
  height: 10,
  id: 'g1',
  name: 'Group',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
};

describe('isAppearanceNode', () => {
  it('should accept a rectangle node', () => {
    // result
    expect(isAppearanceNode(rectangle)).toBe(true);
  });

  it('should reject a node type without corner radius support', () => {
    // result
    expect(isAppearanceNode(group)).toBe(false);
  });

  it('should reject undefined', () => {
    // result
    expect(isAppearanceNode(undefined)).toBe(false);
  });
});
