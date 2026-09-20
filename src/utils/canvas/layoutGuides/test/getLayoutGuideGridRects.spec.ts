// types
import { LayoutGuideType, NodeType } from 'types/design/enums';
import { TFrameNode, TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideGridRects } from '../getLayoutGuideGridRects';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [],
  height: 40,
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

const guide: TLayoutGuide = { color: '#FF0000', opacity: 10, size: 20, type: LayoutGuideType.grid };

describe('getLayoutGuideGridRects', () => {
  it('should draw a vertical and a horizontal line at every multiple of size, edge to edge', () => {
    // action
    const rects = getLayoutGuideGridRects(guide, buildFrame(), 1);

    // result — 6 verticals (0,20,40,60,80,100) + 3 horizontals (0,20,40)
    expect(rects).toHaveLength(9);
    expect(rects[0]).toEqual({ fill: '#FF0000', fillAlpha: 0.1, height: 40, width: 1, x: -0.5, y: 0 });
    expect(rects[6]).toEqual({ fill: '#FF0000', fillAlpha: 0.1, height: 1, width: 100, x: 0, y: -0.5 });
  });

  it('should offset every rect by the frame position', () => {
    // action
    const rects = getLayoutGuideGridRects(guide, buildFrame({ x: 10, y: 5 }), 1);

    // result
    expect(rects[0].x).toBe(9.5);
    expect(rects[6].y).toBe(4.5);
  });

  it('should widen the guide lines to keep them visible at a smaller zoom', () => {
    // action
    const rects = getLayoutGuideGridRects(guide, buildFrame(), 4);

    // result
    expect(rects[0].width).toBe(4);
    expect(rects[6].height).toBe(4);
  });
});
