// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getAlignableSelectionGroups } from '../getAlignableSelectionGroups';

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

describe('getAlignableSelectionGroups', () => {
  it('should group the selection by parent and keep only groups of two or more', () => {
    // mock
    const a = makeRectangle('a', 0, 0);
    const b = makeRectangle('b', 40, 0);
    const c = makeRectangle('c', 0, 0, 20, 'p');

    // before
    const groups = getAlignableSelectionGroups([a, b, c], { a, b, c });

    // result
    expect(groups).toEqual([[a, b]]);
  });
});
