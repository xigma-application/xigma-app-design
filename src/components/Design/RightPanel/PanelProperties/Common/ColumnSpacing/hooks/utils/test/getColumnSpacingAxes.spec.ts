// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getColumnSpacingAxes } from '../getColumnSpacingAxes';

const makeRectangle = (id: string, x: number, y: number, size = 20): TRectangleNode => ({
  fills: [],
  height: size,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: size,
  x,
  y,
});

describe('getColumnSpacingAxes', () => {
  it('should hide both fields for fewer than two items', () => {
    // result
    expect(getColumnSpacingAxes(1, [makeRectangle('a', 0, 0)])).toEqual({ horizontal: false, vertical: false });
  });

  it('should show both fields for a multi selection', () => {
    // result
    expect(getColumnSpacingAxes(2, [makeRectangle('a', 0, 0), makeRectangle('b', 40, 0)])).toEqual({ horizontal: true, vertical: true });
  });

  it('should use the free-form axes for the children of one container', () => {
    // result
    expect(getColumnSpacingAxes(1, [makeRectangle('a', 0, 0), makeRectangle('b', 40, 0)])).toEqual({ horizontal: true, vertical: false });
  });
});
