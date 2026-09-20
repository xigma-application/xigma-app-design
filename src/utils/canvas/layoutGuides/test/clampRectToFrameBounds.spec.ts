// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { clampRectToFrameBounds } from '../clampRectToFrameBounds';

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fills: [],
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
};

describe('clampRectToFrameBounds', () => {
  it('should leave a rect that already fits inside the frame untouched', () => {
    // action
    const rect = clampRectToFrameBounds({ fill: '#fff', fillAlpha: 1, height: 40, width: 40, x: 10, y: 10 }, frame);

    // result
    expect(rect).toEqual({ fill: '#fff', fillAlpha: 1, height: 40, width: 40, x: 10, y: 10 });
  });

  it('should cut off the part of a rect that extends past the bottom edge', () => {
    // action
    const rect = clampRectToFrameBounds({ fill: '#fff', fillAlpha: 1, height: 60, width: 40, x: 10, y: 70 }, frame);

    // result — only 30px of the 60px height remains inside the frame
    expect(rect).toEqual({ fill: '#fff', fillAlpha: 1, height: 30, width: 40, x: 10, y: 70 });
  });

  it('should cut off the part of a rect that starts before the left edge', () => {
    // action
    const rect = clampRectToFrameBounds({ fill: '#fff', fillAlpha: 1, height: 40, width: 40, x: -20, y: 10 }, frame);

    // result — the left 20px is outside the frame, only 20px of width remains
    expect(rect).toEqual({ fill: '#fff', fillAlpha: 1, height: 40, width: 20, x: 0, y: 10 });
  });

  it('should collapse a rect that falls entirely outside the frame to zero size', () => {
    // action
    const rect = clampRectToFrameBounds({ fill: '#fff', fillAlpha: 1, height: 40, width: 40, x: 200, y: 10 }, frame);

    // result
    expect(rect.width).toBe(0);
  });

  it('should offset the clamp by a non-zero frame position', () => {
    // mock
    const offsetFrame = { ...frame, x: 50, y: 50 };

    // action
    const rect = clampRectToFrameBounds({ fill: '#fff', fillAlpha: 1, height: 40, width: 40, x: 40, y: 60 }, offsetFrame);

    // result — clamped to the offset frame's left edge at x=50
    expect(rect).toEqual({ fill: '#fff', fillAlpha: 1, height: 40, width: 30, x: 50, y: 60 });
  });
});
