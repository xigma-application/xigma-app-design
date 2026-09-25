// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { distributeNodes } from '../distributeNodes';

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

describe('distributeNodes', () => {
  beforeEach(() => {
    translateMock.mockClear();
  });

  it('should space the layers evenly between the outermost ones horizontally', () => {
    // mock
    const dispatch = vi.fn();
    const a = makeRectangle('a', 0, 0);
    const b = makeRectangle('b', 30, 0);
    const c = makeRectangle('c', 100, 0);

    // before
    distributeNodes(dispatch, { a, b, c }, [c, a, b], 'horizontal');

    // result
    expect(translateMock.mock.calls.map(([, , node, x, y]) => [node.id, x, y])).toEqual([
      ['a', 0, 0],
      ['b', 20, 0],
      ['c', 0, 0],
    ]);
  });

  it('should move along y for the vertical axis', () => {
    // mock
    const a = makeRectangle('a', 0, 0);
    const b = makeRectangle('b', 0, 60);
    const c = makeRectangle('c', 0, 100);

    // before
    distributeNodes(vi.fn(), { a, b, c }, [a, b, c], 'vertical');

    // result
    expect(translateMock.mock.calls[1].slice(2)).toEqual([b, 0, -10]);
  });
});
