// types
import { LayoutGuideType, NodeType } from 'types/design/enums';
import { TFrameNode, TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideRects } from '../getLayoutGuideRects';

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fills: [],
  height: 40,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 40,
  x: 0,
  y: 0,
};

describe('getLayoutGuideRects', () => {
  it('should draw grid lines for a grid guide', () => {
    // mock
    const guide: TLayoutGuide = { color: '#FF0000', opacity: 10, size: 20, type: LayoutGuideType.grid };

    // action
    const rects = getLayoutGuideRects(guide, frame, 1);

    // result — 3 verticals + 3 horizontals at 0/20/40
    expect(rects).toHaveLength(6);
  });

  it('should draw column bands for a columns guide', () => {
    // mock
    const guide: TLayoutGuide = { color: '#FF0000', count: 2, gutter: 0, opacity: 10, type: LayoutGuideType.columns };

    // action
    const rects = getLayoutGuideRects(guide, frame, 1);

    // result
    expect(rects).toHaveLength(2);
    expect(rects.every((rect) => rect.height === 40)).toBe(true);
  });

  it('should draw row bands for a rows guide', () => {
    // mock
    const guide: TLayoutGuide = { color: '#FF0000', count: 2, gutter: 0, opacity: 10, type: LayoutGuideType.rows };

    // action
    const rects = getLayoutGuideRects(guide, frame, 1);

    // result
    expect(rects).toHaveLength(2);
    expect(rects.every((rect) => rect.width === 40)).toBe(true);
  });
});
