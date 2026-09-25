// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { translateNodeSubtree } from '../translateNodeSubtree';

const translateNodesMock = vi.fn();

vi.mock('components/Design/Canvas/utils/translateNodes', () => ({
  translateNodes: (...args: unknown[]): unknown => translateNodesMock(...args),
}));

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

describe('translateNodeSubtree', () => {
  it('should translate the node with its nudge subtree', () => {
    // mock
    const dispatch = vi.fn();
    const node = makeRectangle('a', 0, 0);

    // before
    translateNodeSubtree(dispatch, { a: node }, node, 4, -2);

    // result
    expect(translateNodesMock).toHaveBeenCalledWith(dispatch, [node], 4, -2);
  });
});
