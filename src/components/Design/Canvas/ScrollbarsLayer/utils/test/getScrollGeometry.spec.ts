// others
import { SCROLLBAR_RANGE_PADDING_PX } from '../../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getScrollGeometry } from '../getScrollGeometry';

const canvasRect = { height: 600, width: 800 } as DOMRect;
const viewport = { x: 0, y: 0, zoom: 1 };

const buildNode = (overrides: Partial<TSceneNode>): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#ff0000',
    height: 10,
    id: 'node',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('getScrollGeometry', () => {
  it('should use the content bounds when there are nodes', () => {
    // mock
    const nodes = [buildNode({ height: 100, width: 100, x: 0, y: 0 })];

    // before
    const { range, visibleRect } = getScrollGeometry(canvasRect, 0, 0, nodes, viewport);

    // result
    expect(visibleRect).toEqual({ height: 600, width: 800, x: 0, y: 0 });
    expect(range).toEqual({
      height: 600 + SCROLLBAR_RANGE_PADDING_PX * 2,
      width: 800 + SCROLLBAR_RANGE_PADDING_PX * 2,
      x: -SCROLLBAR_RANGE_PADDING_PX,
      y: -SCROLLBAR_RANGE_PADDING_PX,
    });
  });

  it('should fall back to the visible world rect when there are no nodes', () => {
    // before
    const { range, visibleRect } = getScrollGeometry(canvasRect, 0, 0, [], viewport);

    // result — content bounds default to exactly what's on screen, so the range is just the padded view
    expect(range).toEqual({
      height: 600 + SCROLLBAR_RANGE_PADDING_PX * 2,
      width: 800 + SCROLLBAR_RANGE_PADDING_PX * 2,
      x: -SCROLLBAR_RANGE_PADDING_PX,
      y: -SCROLLBAR_RANGE_PADDING_PX,
    });
    expect(visibleRect).toEqual({ height: 600, width: 800, x: 0, y: 0 });
  });

  it('should shrink the visible rect by the panel widths before computing the range', () => {
    // before
    const { range, visibleRect } = getScrollGeometry(canvasRect, 200, 100, [], viewport);

    // result
    expect(visibleRect).toEqual({ height: 600, width: 500, x: 200, y: 0 });
    expect(range).toEqual({
      height: 600 + SCROLLBAR_RANGE_PADDING_PX * 2,
      width: 500 + SCROLLBAR_RANGE_PADDING_PX * 2,
      x: 200 - SCROLLBAR_RANGE_PADDING_PX,
      y: -SCROLLBAR_RANGE_PADDING_PX,
    });
  });
});
