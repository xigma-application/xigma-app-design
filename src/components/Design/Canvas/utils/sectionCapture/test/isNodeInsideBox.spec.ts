// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { isNodeInsideBox } from '../isNodeInsideBox';

const makeRectangle = (id: string, x: number, y: number, parentId: string | null = null): TRectangleNode => ({
  fills: [],
  height: 50,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x,
  y,
});

describe('isNodeInsideBox', () => {
  it('should be true only when the whole node box fits in the box', () => {
    // action / result
    expect(isNodeInsideBox(makeRectangle('a', 0, 0), { height: 50, width: 50, x: 0, y: 0 })).toBe(true);
    expect(isNodeInsideBox(makeRectangle('a', 10, 0), { height: 50, width: 50, x: 0, y: 0 })).toBe(false);
    expect(isNodeInsideBox(makeRectangle('a', 0, -10), { height: 100, width: 100, x: 0, y: 0 })).toBe(false);
    expect(isNodeInsideBox(makeRectangle('a', 0, 60), { height: 100, width: 100, x: 0, y: 0 })).toBe(false);
  });
});
