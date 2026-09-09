// types
import { InsideStroke, LayoutVersion, NodeType, StrokeAlign } from 'types/design/enums';
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

  it('should equal the literal padding when the stroke width is zero', () => {
    const padded = frame({ paddingTop: 6, strokeWidth: 0 });

    expect(getFrameLayoutPadding(padded)).toEqual({ paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 6 });
  });

  describe('legacy layout version', () => {
    it('should add the stroke width to every side when the inside-stroke toggle is included (its default)', () => {
      const padded = frame({ paddingBottom: 4, paddingLeft: 8, paddingRight: 12, paddingTop: 16, strokeColor: '#000', strokeWidth: 1 });

      expect(getFrameLayoutPadding(padded, LayoutVersion.legacy)).toEqual({
        paddingBottom: 5,
        paddingLeft: 9,
        paddingRight: 13,
        paddingTop: 17,
      });
    });

    it('should add the stroke width when the inside-stroke toggle is explicitly included', () => {
      const padded = frame({ insideStroke: InsideStroke.included, strokeColor: '#000', strokeWidth: 2 });

      expect(getFrameLayoutPadding(padded, LayoutVersion.legacy)).toEqual({
        paddingBottom: 2,
        paddingLeft: 2,
        paddingRight: 2,
        paddingTop: 2,
      });
    });

    it('should ignore the stroke width when the inside-stroke toggle is excluded', () => {
      const padded = frame({ insideStroke: InsideStroke.excluded, paddingLeft: 8, strokeColor: '#000', strokeWidth: 2 });

      expect(getFrameLayoutPadding(padded, LayoutVersion.legacy)).toEqual({
        paddingBottom: 0,
        paddingLeft: 8,
        paddingRight: 0,
        paddingTop: 0,
      });
    });

    it('should not read the stroke alignment', () => {
      const padded = frame({ insideStroke: InsideStroke.excluded, strokeAlign: StrokeAlign.inside, strokeColor: '#000', strokeWidth: 3 });

      expect(getFrameLayoutPadding(padded, LayoutVersion.legacy)).toEqual({
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
      });
    });
  });

  describe('updated layout version', () => {
    it('should add the stroke width to every side only for an inside-aligned stroke', () => {
      const padded = frame({ paddingLeft: 8, strokeAlign: StrokeAlign.inside, strokeColor: '#000', strokeWidth: 2 });

      expect(getFrameLayoutPadding(padded)).toEqual({ paddingBottom: 2, paddingLeft: 10, paddingRight: 2, paddingTop: 2 });
    });

    it('should ignore a centred stroke', () => {
      const padded = frame({ strokeAlign: StrokeAlign.center, strokeColor: '#000', strokeWidth: 4 });

      expect(getFrameLayoutPadding(padded)).toEqual({ paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 });
    });

    it('should ignore an outside stroke', () => {
      const padded = frame({ strokeAlign: StrokeAlign.outside, strokeColor: '#000', strokeWidth: 4 });

      expect(getFrameLayoutPadding(padded)).toEqual({ paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 });
    });

    it('should treat a stroke with no explicit alignment as centred, so it does not affect layout', () => {
      const padded = frame({ strokeColor: '#000', strokeWidth: 4 });

      expect(getFrameLayoutPadding(padded)).toEqual({ paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 });
    });

    it('should not read the inside-stroke toggle', () => {
      const padded = frame({ insideStroke: InsideStroke.included, strokeColor: '#000', strokeWidth: 4 });

      expect(getFrameLayoutPadding(padded)).toEqual({ paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 });
    });
  });
});
