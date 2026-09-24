// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getFreeFormSpacingAxes } from '../getFreeFormSpacingAxes';

const makeRectangle = (id: string, x: number, y: number, size = 20): TRectangleNode => ({
  fills: [],
  height: size,
  id,
  name: id,
  parentId: 'frame',
  rotation: 0,
  type: NodeType.rectangle,
  width: size,
  x,
  y,
});

describe('getFreeFormSpacingAxes', () => {
  it('should show only the horizontal field for children side by side', () => {
    // mock
    const items = [makeRectangle('a', 0, 0), makeRectangle('b', 40, 5)];

    // action / result
    expect(getFreeFormSpacingAxes(items)).toEqual({ horizontal: true, vertical: false });
  });

  it('should show only the vertical field for children stacked', () => {
    // mock
    const items = [makeRectangle('a', 0, 0), makeRectangle('b', 5, 40)];

    // action / result
    expect(getFreeFormSpacingAxes(items)).toEqual({ horizontal: false, vertical: true });
  });

  it('should show both fields for an evenly spaced pseudo grid', () => {
    // mock
    const items = [makeRectangle('a', 0, 0), makeRectangle('b', 30, 0), makeRectangle('c', 0, 30), makeRectangle('d', 30, 30)];

    // action / result
    expect(getFreeFormSpacingAxes(items)).toEqual({ horizontal: true, vertical: true });
  });

  it('should hide the field for three unevenly spaced children', () => {
    // mock
    const items = [makeRectangle('a', 0, 0), makeRectangle('b', 30, 0), makeRectangle('c', 90, 0)];

    // action / result
    expect(getFreeFormSpacingAxes(items)).toEqual({ horizontal: false, vertical: false });
  });

  it('should pick the axis with the wider spread when two children overlap on both axes', () => {
    // mock
    const items = [makeRectangle('a', 0, 0, 40), makeRectangle('b', 30, 5, 40)];

    // action / result
    expect(getFreeFormSpacingAxes(items)).toEqual({ horizontal: true, vertical: false });
  });
});
