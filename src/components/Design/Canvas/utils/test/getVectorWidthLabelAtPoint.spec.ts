// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorWidthLabelAtPoint } from '../getVectorWidthLabelAtPoint';

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
  fillColor: '#000',
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

describe('getVectorWidthLabelAtPoint', () => {
  beforeEach(() => {
    getVectorWidthLabelTargetsMock.mockReset();
    // a 12 x 18 glyph box: badge is 22 x 24 at zoom 1 (padding 5 / 3)
    getGlyphQuadBoundsMock.mockReset().mockReturnValue({ maxX: 6, maxY: 9, minX: -6, minY: -9 });
  });

  it('should return null when there are no visible labels', () => {
    // mock
    getVectorWidthLabelTargetsMock.mockReturnValue([]);

    // before
    const result = getVectorWidthLabelAtPoint({ x: 20, y: -34 }, nodesWith(buildNode()), refs, 1);

    // result
    expect(result).toBeNull();
  });

  it('should return the label’s node/segment/t when the point lands inside the badge', () => {
    // mock — anchor (20,0), right handle (20,-6), label centre 28px further along -normal at (20,-34)
    const node = buildNode();

    getVectorWidthLabelTargetsMock.mockReturnValue([{ nodeId: node.id, ...RIGHT_TARGET }]);

    // before
    const result = getVectorWidthLabelAtPoint({ x: 20, y: -34 }, nodesWith(node), refs, 1);

    // result
    expect(result?.nodeId).toBe(node.id);
    expect(result?.segmentId).toBe('s1');
    expect(result?.t).toBeCloseTo(0.2, 5);
  });

  it('should return null when the point is well outside the badge', () => {
    // mock
    const node = buildNode();

    getVectorWidthLabelTargetsMock.mockReturnValue([{ nodeId: node.id, ...RIGHT_TARGET }]);

    // before
    const result = getVectorWidthLabelAtPoint({ x: 20, y: 100 }, nodesWith(node), refs, 1);

    // result
    expect(result).toBeNull();
  });

  it('should skip a target whose node has gone missing', () => {
    // mock
    getVectorWidthLabelTargetsMock.mockReturnValue([{ nodeId: 'gone', ...RIGHT_TARGET }]);

    // before
    const result = getVectorWidthLabelAtPoint({ x: 20, y: -34 }, nodesWith(buildNode()), refs, 1);

    // result
    expect(result).toBeNull();
  });

  it('should skip a target whose text measures to no glyph bounds', () => {
    // mock
    const node = buildNode();

    getGlyphQuadBoundsMock.mockReturnValue(null);
    getVectorWidthLabelTargetsMock.mockReturnValue([{ nodeId: node.id, ...RIGHT_TARGET }]);

    // before
    const result = getVectorWidthLabelAtPoint({ x: 20, y: -34 }, nodesWith(node), refs, 1);

    // result
    expect(result).toBeNull();
  });
});
