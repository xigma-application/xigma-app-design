// types
import { NodeType } from 'types/design/enums';
import { TGlyphAtlasJson } from 'types/msdf';
import { TSceneNode, TTextNode, TVectorNode } from 'types/design/types';

const { getCurvedTextGlyphContours, getTextGlyphContours } = vi.hoisted(() => ({
  getCurvedTextGlyphContours: vi.fn(),
  getTextGlyphContours: vi.fn(),
}));

vi.mock('../getCurvedTextGlyphContours', () => ({ getCurvedTextGlyphContours }));
vi.mock('../getTextGlyphContours', () => ({ getTextGlyphContours }));

// utils
import { getTextOutlineAsStrokeGlyphVectors } from '../getTextOutlineAsStrokeGlyphVectors';

const ATLAS = {} as TGlyphAtlasJson;

const buildNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Ha',
  fill: '#123456',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 20,
  height: 40,
  id: 'text-1',
  name: 'Text',
  parentId: 'frame-1',
  pathId: null,
  rotation: 0,
  strokeColor: undefined,
  strokeWidth: 0,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

// two plain 10x10 square glyphs, offset like two letters sitting side by side with a gap — chosen
// so a 90° rotation around the pair's SHARED bounding-box center moves them to a new, distinct,
// still-separated location, whereas rotating each independently around its own (symmetric) center
// would leave both squares exactly where they started — the two outcomes can't be confused
const GLYPH_A = [
  { end: { x: 10, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 10, y: 10 }, start: { x: 10, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 0, y: 10 }, start: { x: 10, y: 10 }, tangentEnd: null, tangentStart: null },
  { end: { x: 0, y: 0 }, start: { x: 0, y: 10 }, tangentEnd: null, tangentStart: null },
];
const GLYPH_B = [
  { end: { x: 30, y: 0 }, start: { x: 20, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 30, y: 10 }, start: { x: 30, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 20, y: 10 }, start: { x: 30, y: 10 }, tangentEnd: null, tangentStart: null },
  { end: { x: 20, y: 0 }, start: { x: 20, y: 10 }, tangentEnd: null, tangentStart: null },
];

const collectPoints = (vector: TVectorNode): { x: number; y: number }[] => Object.values(vector.vertices).map(({ x, y }) => ({ x, y }));

// rotated coordinates aren't rounded (rounding each one independently would destroy the relative
// sub-pixel offsets curved glyph segments rely on), so matches need a tolerance for floating-point
// noise from Math.cos(90deg) not being an exact 0 — an exact toEqual/arrayContaining would be flaky
const expectPointsCloseTo = (actual: { x: number; y: number }[], expected: { x: number; y: number }[]): void => {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((point) => {
    const found = actual.some((candidate) => Math.abs(candidate.x - point.x) < 1e-6 && Math.abs(candidate.y - point.y) < 1e-6);

    expect(found).toBe(true);
  });
};

describe('getTextOutlineAsStrokeGlyphVectors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return one vector per glyph rather than fusing them into one shape', async () => {
    // mock
    getTextGlyphContours.mockResolvedValueOnce([[GLYPH_A], [GLYPH_B]]);

    // action
    const result = await getTextOutlineAsStrokeGlyphVectors(ATLAS, buildNode());

    // result
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe(NodeType.vector);
    expect(result[1].type).toBe(NodeType.vector);
  });

  it('should merge each glyph’s own fill and stroke band into that one glyph’s vector', async () => {
    // mock — single glyph, no path
    getTextGlyphContours.mockResolvedValueOnce([[GLYPH_A]]);

    // action
    const result = await getTextOutlineAsStrokeGlyphVectors(ATLAS, buildNode({ strokeColor: '#000000', strokeWidth: 4 }));

    // result — the glyph's own fill face plus its stroke band's outer+inner faces
    expect(result).toHaveLength(1);
    expect(result[0].filledFaceKeys).toHaveLength(3);
  });

  it('should skip the stroke band entirely when the node has no stroke set', async () => {
    // mock
    getTextGlyphContours.mockResolvedValueOnce([[GLYPH_A]]);

    // action
    const result = await getTextOutlineAsStrokeGlyphVectors(ATLAS, buildNode());

    // result — just the glyph's own fill face
    expect(result[0].filledFaceKeys).toHaveLength(1);
  });

  it('should treat a missing strokeWidth as zero (no stroke band)', async () => {
    // mock
    getTextGlyphContours.mockResolvedValueOnce([[GLYPH_A]]);

    // action — strokeColor set but strokeWidth left undefined
    const result = await getTextOutlineAsStrokeGlyphVectors(ATLAS, buildNode({ strokeColor: '#000000', strokeWidth: undefined }));

    // result — still just the fill face, the undefined width falls back to 0
    expect(result[0].filledFaceKeys).toHaveLength(1);
  });

  it('should return an empty list for a path-bound text whose path node can’t be resolved', async () => {
    // action — no pathNode argument passed at all
    const result = await getTextOutlineAsStrokeGlyphVectors(ATLAS, buildNode({ pathId: 'path-1' }));

    // result
    expect(result).toEqual([]);
    expect(getTextGlyphContours).not.toHaveBeenCalled();
    expect(getCurvedTextGlyphContours).not.toHaveBeenCalled();
  });

  it('should use the curved contour builder, not the straight one, once the path node resolves', async () => {
    // mock
    getCurvedTextGlyphContours.mockResolvedValueOnce([[GLYPH_A]]);

    const pathNode = { id: 'path-1', type: NodeType.vector } as unknown as TSceneNode;

    // action
    const result = await getTextOutlineAsStrokeGlyphVectors(ATLAS, buildNode({ pathId: 'path-1' }), pathNode);

    // result
    expect(getCurvedTextGlyphContours).toHaveBeenCalled();
    expect(getTextGlyphContours).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('should return an empty list when there are no visible glyphs', async () => {
    // mock
    getTextGlyphContours.mockResolvedValueOnce([]);

    // action
    const result = await getTextOutlineAsStrokeGlyphVectors(ATLAS, buildNode({ content: '' }));

    // result
    expect(result).toEqual([]);
  });

  it('should drop a glyph that produces no fill and no stroke geometry (e.g. a space between letters)', async () => {
    // mock — middle "glyph" (a space) has no contours, so it yields neither a fill nor a stroke vector
    getTextGlyphContours.mockResolvedValueOnce([[GLYPH_A], [], [GLYPH_B]]);

    // action
    const result = await getTextOutlineAsStrokeGlyphVectors(ATLAS, buildNode({ content: 'H a' }));

    // result — only the two real letters survive
    expect(result).toHaveLength(2);
  });

  it('should rotate every letter rigidly around one shared pivot instead of each around its own center', async () => {
    // mock — two glyphs, rotated as a pair around their combined bounding-box center (15, 5)
    getTextGlyphContours.mockResolvedValueOnce([[GLYPH_A], [GLYPH_B]]);

    // action
    const result = await getTextOutlineAsStrokeGlyphVectors(ATLAS, buildNode({ rotation: 90 }));

    // result — rotation is baked into the vertices (not left as a field), moving each letter to a
    // new, still mutually-separated location; a per-letter-own-center rotation would instead leave
    // both symmetric squares exactly where they started
    expect(result[0].rotation).toBe(0);
    expect(result[1].rotation).toBe(0);

    expectPointsCloseTo(collectPoints(result[0]), [
      { x: 20, y: -10 },
      { x: 20, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: -10 },
    ]);
    expectPointsCloseTo(collectPoints(result[1]), [
      { x: 20, y: 10 },
      { x: 20, y: 20 },
      { x: 10, y: 20 },
      { x: 10, y: 10 },
    ]);
  });
});
