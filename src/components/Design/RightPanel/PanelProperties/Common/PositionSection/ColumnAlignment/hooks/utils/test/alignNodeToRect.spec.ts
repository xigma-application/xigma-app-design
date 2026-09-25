// types
import { AlignmentHorizontal, AlignmentVertical, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { alignNodeToRect } from '../alignNodeToRect';

const translateMock = vi.fn();

vi.mock('../translateNodeSubtree', () => ({ translateNodeSubtree: (...args: unknown[]): unknown => translateMock(...args) }));

const makeRectangle = (id: string, x: number, y: number, width = 20, parentId: string | null = null): TRectangleNode => ({
  fills: [],
  height: 20,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width,
  x,
  y,
});

describe('alignNodeToRect', () => {
  it('should move the node by the offset that aligns it inside the target', () => {
    // mock
    const dispatch = vi.fn();
    const node = makeRectangle('a', 10, 10);
    const nodes = { a: node };

    // before
    alignNodeToRect(
      dispatch,
      nodes,
      node,
      { height: 100, width: 100, x: 0, y: 0 },
      { horizontal: AlignmentHorizontal.right, vertical: AlignmentVertical.center },
    );

    // result
    expect(translateMock).toHaveBeenCalledWith(dispatch, nodes, node, 70, 30);
  });
});
