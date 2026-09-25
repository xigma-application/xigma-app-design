// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getReversedWrapLineOrder } from '../getReversedWrapLineOrder';

const box = (id: string, x: number, y: number, extra: object = {}): TSceneNode =>
  ({ height: 10, id, rotation: 0, type: NodeType.rectangle, width: 10, x, y, ...extra }) as TSceneNode;

const nodes = {
  a: box('a', 0, 0),
  abs: box('abs', 0, 0, { ignoreAutoLayout: true }),
  b: box('b', 20, 0),
  c: box('c', 0, 20),
  d: box('d', 20, 20),
} as Record<string, TSceneNode>;

describe('getReversedWrapLineOrder', () => {
  it('should reverse the wrapped rows of a horizontal flow flipped vertically, leaving absolute children in place', () => {
    // mock
    const frame = { childIds: ['a', 'b', 'abs', 'c', 'd', 'missing'], layoutMode: LayoutMode.horizontal, layoutWrap: true } as TFrameNode;

    // result
    expect(getReversedWrapLineOrder(frame, nodes, 'vertical')).toEqual(['c', 'd', 'abs', 'a', 'b', 'missing']);
  });

  it('should reverse the wrapped columns of a vertical flow flipped horizontally', () => {
    // mock
    const frame = { childIds: ['a', 'c', 'b', 'd'], layoutMode: LayoutMode.vertical, layoutWrap: true } as TFrameNode;

    // result
    expect(getReversedWrapLineOrder(frame, nodes, 'horizontal')).toEqual(['b', 'd', 'a', 'c']);
  });

  it('should keep the order when the frame does not wrap or the flip runs along the flow', () => {
    // result
    expect(getReversedWrapLineOrder({ childIds: ['a'], layoutMode: LayoutMode.horizontal } as TFrameNode, nodes, 'vertical')).toBeNull();
    expect(
      getReversedWrapLineOrder({ childIds: ['a'], layoutMode: LayoutMode.horizontal, layoutWrap: true } as TFrameNode, nodes, 'horizontal'),
    ).toBeNull();
    expect(
      getReversedWrapLineOrder({ childIds: ['a'], layoutMode: LayoutMode.grid, layoutWrap: true } as TFrameNode, nodes, 'vertical'),
    ).toBeNull();
  });
});
