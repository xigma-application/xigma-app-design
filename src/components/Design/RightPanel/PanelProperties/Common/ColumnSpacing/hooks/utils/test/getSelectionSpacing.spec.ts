// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getSelectionSpacing } from '../getSelectionSpacing';

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

describe('getSelectionSpacing', () => {
  it('should return the shared gap between neighbours in position order', () => {
    // mock
    const items = [makeRectangle('c', 80, 0), makeRectangle('a', 0, 0), makeRectangle('b', 40, 0)];

    // action / result
    expect(getSelectionSpacing(items, 'horizontal')).toBe(20);
  });

  it('should report mixed for uneven gaps', () => {
    // mock
    const items = [makeRectangle('a', 0, 0), makeRectangle('b', 30, 0), makeRectangle('c', 90, 0)];

    // action / result
    expect(getSelectionSpacing(items, 'horizontal')).toBe('mixed');
  });

  it('should measure overlapping layers as a negative gap on the vertical axis', () => {
    // mock
    const items = [makeRectangle('a', 0, 0), makeRectangle('b', 0, 10)];

    // action / result
    expect(getSelectionSpacing(items, 'vertical')).toBe(-10);
  });

  it('should measure the gap between columns and rows of a grid', () => {
    // mock
    const items = [makeRectangle('a', 0, 0, 30), makeRectangle('b', 60, 0, 40), makeRectangle('c', 0, 70, 20)];

    // action / result
    expect(getSelectionSpacing(items, 'horizontal')).toBe(30);
    expect(getSelectionSpacing(items, 'vertical')).toBe(30);
  });
});
