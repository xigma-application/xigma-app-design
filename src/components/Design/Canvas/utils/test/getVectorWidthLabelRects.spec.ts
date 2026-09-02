// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorWidthLabelRects, isPointInVectorWidthLabelRect } from '../getVectorWidthLabelRects';

const getVectorWidthLabelTargetsMock = vi.fn();
const getGlyphQuadBoundsMock = vi.fn();

vi.mock(
  'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawVectorWidthPointsPreview/getVectorWidthLabelTargets',
  () => ({
    getVectorWidthLabelTargets: (...args: unknown[]): unknown => getVectorWidthLabelTargetsMock(...args),
  }),
);
vi.mock('utils/canvas/text/buildGlyphQuads', () => ({
  buildGlyphQuads: (): number[] => [1, 2, 3, 4],
}));
vi.mock('utils/canvas/text/getGlyphQuadBounds', () => ({
  getGlyphQuadBounds: (...args: unknown[]): unknown => getGlyphQuadBoundsMock(...args),
}));

const refs = {} as TCanvasRefs;

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
  ...overrides,
});

const nodesWith = (node: TVectorNode): Record<string, TSceneNode> => ({ [node.id]: node });
const RIGHT_TARGET = { point: { id: 'p1', leftOffset: 6, position: 0.2, rightOffset: 6 }, side: 'right' as const };

describe('getVectorWidthLabelRects', () => {
  beforeEach(() => {
    getVectorWidthLabelTargetsMock.mockReset();
    // a 12 x 18 glyph box: badge is 22 x 24 at zoom 1 (padding 5 / 3)
    getGlyphQuadBoundsMock.mockReset().mockReturnValue({ maxX: 6, maxY: 9, minX: -6, minY: -9 });
  });

  it('should return no rects when there are no visible labels', () => {
    // mock
    getVectorWidthLabelTargetsMock.mockReturnValue([]);

    // result
    expect(getVectorWidthLabelRects(refs, nodesWith(buildNode()), 1)).toEqual([]);
  });

  it('should place the badge centre 28px past the right handle, along the negated normal, at zoom 1', () => {
    // mock — anchor (20,0), right handle (20,-6), centre 28px further at (20,-34)
    const node = buildNode();

    getVectorWidthLabelTargetsMock.mockReturnValue([{ nodeId: node.id, ...RIGHT_TARGET }]);

    // before
    const [labelRect] = getVectorWidthLabelRects(refs, nodesWith(node), 1);

    // result
    expect(labelRect.center).toEqual({ x: 20, y: -34 });
    expect(labelRect.badgeWidth).toBe(22);
    expect(labelRect.badgeHeight).toBe(24);
    expect(labelRect.segmentId).toBe('s1');
    expect(labelRect.t).toBeCloseTo(0.2, 5);
    expect(labelRect.target.point.id).toBe('p1');
  });

  it('should skip a target whose node has gone missing', () => {
    // mock
    getVectorWidthLabelTargetsMock.mockReturnValue([{ nodeId: 'gone', ...RIGHT_TARGET }]);

    // result
    expect(getVectorWidthLabelRects(refs, nodesWith(buildNode()), 1)).toEqual([]);
  });

  it('should skip a target whose text measures to no glyph bounds', () => {
    // mock
    const node = buildNode();

    getGlyphQuadBoundsMock.mockReturnValue(null);
    getVectorWidthLabelTargetsMock.mockReturnValue([{ nodeId: node.id, ...RIGHT_TARGET }]);

    // result
    expect(getVectorWidthLabelRects(refs, nodesWith(node), 1)).toEqual([]);
  });
});

describe('isPointInVectorWidthLabelRect', () => {
  const labelRect = {
    badgeHeight: 24,
    badgeWidth: 22,
    center: { x: 20, y: -34 },
    segmentId: 's1',
    t: 0.2,
    target: { nodeId: 'node-1', point: { id: 'p1', leftOffset: 6, position: 0.2, rightOffset: 6 }, side: 'right' as const },
  };

  it('should be true at the exact centre', () => {
    expect(isPointInVectorWidthLabelRect({ x: 20, y: -34 }, labelRect)).toBe(true);
  });

  it('should be true on the badge edge', () => {
    expect(isPointInVectorWidthLabelRect({ x: 31, y: -22 }, labelRect)).toBe(true);
  });

  it('should be false just outside the badge', () => {
    expect(isPointInVectorWidthLabelRect({ x: 32, y: -34 }, labelRect)).toBe(false);
  });
});
