// types
import { InsideStroke, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getFrameLayoutPadding } from '../getFrameLayoutPadding';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getFrameLayoutPadding', () => {
  it('should equal the literal padding when the frame has no stroke', () => {
    const padded = frame({ paddingBottom: 4, paddingLeft: 8, paddingRight: 12, paddingTop: 16 });

    expect(getFrameLayoutPadding(padded)).toEqual({ paddingBottom: 4, paddingLeft: 8, paddingRight: 12, paddingTop: 16 });
  });

  it('should add the stroke width to every side when the stroke is included in layout (the default)', () => {
    const padded = frame({ paddingBottom: 4, paddingLeft: 8, paddingRight: 12, paddingTop: 16, strokeColor: '#000', strokeWidth: 1 });

    expect(getFrameLayoutPadding(padded)).toEqual({ paddingBottom: 5, paddingLeft: 9, paddingRight: 13, paddingTop: 17 });
  });

  it('should add the stroke width to every side when explicitly set to included', () => {
    const padded = frame({ insideStroke: InsideStroke.included, strokeColor: '#000', strokeWidth: 2 });

    expect(getFrameLayoutPadding(padded)).toEqual({ paddingBottom: 2, paddingLeft: 2, paddingRight: 2, paddingTop: 2 });
  });

  it('should ignore the stroke width when excluded from layout', () => {
    const padded = frame({ insideStroke: InsideStroke.excluded, paddingLeft: 8, strokeColor: '#000', strokeWidth: 2 });

    expect(getFrameLayoutPadding(padded)).toEqual({ paddingBottom: 0, paddingLeft: 8, paddingRight: 0, paddingTop: 0 });
  });

  it('should ignore an included setting when the frame has no stroke width', () => {
    const padded = frame({ insideStroke: InsideStroke.included, paddingTop: 6 });

    expect(getFrameLayoutPadding(padded)).toEqual({ paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 6 });
  });
});
