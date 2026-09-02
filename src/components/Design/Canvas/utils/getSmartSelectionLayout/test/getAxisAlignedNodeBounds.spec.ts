// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getAxisAlignedNodeBounds } from '../getAxisAlignedNodeBounds';

const rect = (overrides: Partial<Omit<TRectangleNode, 'type'>> = {}): TSceneNode =>
  ({
    fill: '#000',
    height: 100,
    id: 'r',
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 50,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('getAxisAlignedNodeBounds', () => {
  it('should map each node to its id and axis-aligned bounds', () => {
    expect(getAxisAlignedNodeBounds([rect({ id: 'a', x: 10, y: 20 })])).toEqual([
      { bounds: { height: 100, width: 50, x: 10, y: 20 }, id: 'a' },
    ]);
  });

  it('should use the rotated bounding box for a 90deg-rotated node', () => {
    const [result] = getAxisAlignedNodeBounds([rect({ height: 100, rotation: 90, width: 50, x: 0, y: 0 })]);

    expect(result.bounds.height).toBeCloseTo(50);
    expect(result.bounds.width).toBeCloseTo(100);
    expect(result.bounds.x).toBeCloseTo(-25);
    expect(result.bounds.y).toBeCloseTo(25);
  });
});
