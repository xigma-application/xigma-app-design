// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { isAutoLayoutWrapEnabled } from '../isAutoLayoutWrapEnabled';

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

describe('isAutoLayoutWrapEnabled', () => {
  it('should be false when the frame does not wrap', () => {
    expect(isAutoLayoutWrapEnabled(frame({ layoutWrap: false }), true, SizingMode.fixed, SizingMode.fixed)).toBe(false);
  });

  it('should be true for a wrapping frame with a fixed primary axis', () => {
    expect(isAutoLayoutWrapEnabled(frame({ layoutWrap: true }), true, SizingMode.fixed, SizingMode.fixed)).toBe(true);
  });

  it('should be false for a wrapping frame that hugs its primary axis with no max size', () => {
    expect(isAutoLayoutWrapEnabled(frame({ layoutWrap: true }), true, SizingMode.hug, SizingMode.fixed)).toBe(false);
  });

  it('should be true for a wrapping frame that hugs its primary axis but caps it with a max size', () => {
    expect(isAutoLayoutWrapEnabled(frame({ layoutWrap: true, maxWidth: 300 }), true, SizingMode.hug, SizingMode.fixed)).toBe(true);
  });

  it('should read the vertical axis as primary for a vertical frame', () => {
    expect(isAutoLayoutWrapEnabled(frame({ layoutWrap: true }), false, SizingMode.fixed, SizingMode.hug)).toBe(false);
  });
});
