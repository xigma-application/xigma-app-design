// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { tidyUpNodes } from '../tidyUpNodes';

const translateMock = vi.fn();

vi.mock('../../translateNodeSubtree', () => ({ translateNodeSubtree: (...args: unknown[]): unknown => translateMock(...args) }));
vi.mock('../getTidyUpTargets', () => ({
  getTidyUpTargets: (): unknown => [
    { x: 0, y: 0 },
    { x: 30, y: 0 },
  ],
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

describe('tidyUpNodes', () => {
  it('should move every layer to its tidy target', () => {
    // mock
    const dispatch = vi.fn();
    const a = makeRectangle('a', 2, 3);
    const b = makeRectangle('b', 50, 1);

    // before
    tidyUpNodes(dispatch, { a, b }, [a, b]);

    // result
    expect(translateMock).toHaveBeenCalledWith(dispatch, { a, b }, a, -2, -3);
    expect(translateMock).toHaveBeenCalledWith(dispatch, { a, b }, b, -20, -1);
  });
});
