// others
import { RULER_FRAME_EXTENT_FILL, RULER_SELECTION_BAND_FILL } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getRulerBands } from '../getRulerBands';

const IDENTITY = { x: 0, y: 0, zoom: 1 };

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 100,
  y: 50,
  ...overrides,
});

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#000',
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getRulerBands', () => {
  it('should return no bands and a zero origin when nothing is selected', () => {
    // result
    expect(getRulerBands([], IDENTITY)).toEqual({ leftBand: null, origin: { x: 0, y: 0 }, topBand: null });
  });

  it('should project the selection bbox onto both rulers, in screen pixels', () => {
    // mock
    const nodes: TSceneNode[] = [rect({ height: 40, width: 60, x: 20, y: 10 })];

    // action
    const { leftBand, topBand } = getRulerBands(nodes, { x: 5, y: 7, zoom: 2 });

    // result — screenPx = world * zoom + viewportOffset
    expect(topBand).toEqual({ fill: RULER_SELECTION_BAND_FILL, fromPx: 20 * 2 + 5, toPx: 80 * 2 + 5 });
    expect(leftBand).toEqual({ fill: RULER_SELECTION_BAND_FILL, fromPx: 10 * 2 + 7, toPx: 50 * 2 + 7 });
  });

  it('should keep a world-zero origin for a plain multi-node selection', () => {
    // mock
    const nodes: TSceneNode[] = [rect({ id: 'a', x: 0 }), rect({ id: 'b', x: 200 })];

    // result
    expect(getRulerBands(nodes, IDENTITY).origin).toEqual({ x: 0, y: 0 });
  });

  it('should rebase the origin and brighten the band for a single unrotated frame', () => {
    // mock
    const nodes: TSceneNode[] = [frame({ x: 100, y: 50 })];

    // action
    const { origin, topBand } = getRulerBands(nodes, IDENTITY);

    // result
    expect(origin).toEqual({ x: 100, y: 50 });
    expect(topBand?.fill).toBe(RULER_FRAME_EXTENT_FILL);
  });

  it('should not rebase for a rotated frame', () => {
    // mock
    const nodes: TSceneNode[] = [frame({ rotation: 20 })];

    // result
    expect(getRulerBands(nodes, IDENTITY).origin).toEqual({ x: 0, y: 0 });
    expect(getRulerBands(nodes, IDENTITY).topBand?.fill).toBe(RULER_SELECTION_BAND_FILL);
  });
});
