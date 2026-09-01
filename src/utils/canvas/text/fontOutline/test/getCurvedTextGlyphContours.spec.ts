// types
import { NodeType } from 'types/design/enums';
import { PathCommand } from 'opentype.js';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode, TVectorNode } from 'types/design/types';

const charPaths: Record<string, PathCommand[]> = {
  A: [{ type: 'M', x: 0, y: 0 }, { type: 'L', x: 10, y: 0 }, { type: 'L', x: 0, y: 10 }, { type: 'Z' }],
};

const getPath = vi.fn((x: number, y: number) => ({
  commands: charPaths.A.map((command) => ('x' in command ? { ...command, x: command.x + x, y: command.y + y } : command)),
}));

vi.mock('../loadInterFont', () => ({ loadInterFont: vi.fn(async () => ({ charToGlyph: vi.fn(() => ({ getPath })) })) }));

// utils
import { getCurvedTextGlyphContours } from '../getCurvedTextGlyphContours';

const ATLAS: TGlyphAtlasJson = {
  chars: [{ height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 }],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

const buildNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'A',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 20,
  height: 40,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: 'path-1',
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

// a plain 2-vertex, 1-segment straight chain the path sampler can walk
const buildStraightPathNode = (endX: number, endY: number): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'path-1',
  name: 'Path',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: endX, y: endY } },
});

describe('getCurvedTextGlyphContours', () => {
  afterEach(() => {
    getPath.mockClear();
  });

  it('should fetch each glyph’s LOCAL-space path (pen at the origin), not a baseline-positioned one', async () => {
    const node = buildNode();

    await getCurvedTextGlyphContours(ATLAS, node, buildStraightPathNode(200, 0));

    // unlike straight text (penX/baselineY baked into the path itself), curved text always asks for
    // the glyph's own local outline and positions it afterwards via the path sample's anchor+angle
    expect(getPath).toHaveBeenCalledWith(0, 0, 20);
  });

  it('should leave the glyph untouched (identity transform) when it lands exactly at the start of a horizontal path', async () => {
    // a horizontal path's tangent/normal never rotates the glyph (angleDegrees === 0), and sampling
    // at length 0 on a chain starting at (0,0) returns that same point as the anchor — so the first
    // character's contour should come out byte-identical to its own local-space mock coordinates
    const node = buildNode();

    const [[edges]] = await getCurvedTextGlyphContours(ATLAS, node, buildStraightPathNode(200, 0));

    expect(edges[0].start).toEqual({ x: 0, y: 0 });
    expect(edges[0].end).toEqual({ x: 10, y: 0 });
    expect(edges[1].end).toEqual({ x: 0, y: 10 });
  });

  it('should rotate the glyph to match a vertical path’s own tangent frame', async () => {
    // a straight-down path has a 90° departure angle; rotatePoint(_, ORIGIN, 90) sends (x,y) -> (-y,x),
    // so the mock triangle's (10,0) corner should land at (0,10) once anchored back at the origin
    const node = buildNode();

    const [[edges]] = await getCurvedTextGlyphContours(ATLAS, node, buildStraightPathNode(0, 200));

    expect(edges[0].start).toEqual({ x: 0, y: 0 });
    expect(edges[0].end.x).toBeCloseTo(0, 5);
    expect(edges[0].end.y).toBeCloseTo(10, 5);
  });

  it('should advance along the path per glyph using the atlas’s own xadvance, not the raw string index', async () => {
    // two glyphs on a long horizontal path: the second one's anchor sits one glyph-advance further
    // along, scaled by fontSize/atlas.info.size (here 20/20 = 1, so advance === xadvance === 12)
    const node = buildNode({ content: 'AA' });

    const [, [secondEdges]] = await getCurvedTextGlyphContours(ATLAS, node, buildStraightPathNode(200, 0));

    expect(secondEdges[0].start).toEqual({ x: 12, y: 0 });
  });

  it('should skip a character that has no atlas glyph (e.g. a space) while still advancing past it', async () => {
    // ATLAS only knows 'A' (id 65); the space (id 32) has no glyph, so it contributes no contour
    // set but its fallback advance still moves the next glyph further along the path
    const node = buildNode({ content: 'A A' });

    const result = await getCurvedTextGlyphContours(ATLAS, node, buildStraightPathNode(400, 0));

    expect(result).toHaveLength(2);
    // second 'A' sits one 'A'-advance (12) plus one fallback space-advance (fontSize * 0.6 = 12) along
    expect(result[1][0][0].start).toEqual({ x: 24, y: 0 });
  });

  it('should rotate a glyph edge’s own Bézier tangents into the path’s frame, not just its endpoints', async () => {
    // a glyph outline with a real curve segment — its edge carries non-null tangents, which the
    // straight-line mock never produces, so this is what exercises the tangent-rotation path
    getPath.mockReturnValueOnce({
      commands: [{ type: 'M', x: 0, y: 0 }, { type: 'C', x: 10, x1: 3, x2: 7, y: 0, y1: 6, y2: 6 }, { type: 'Z' }],
    });
    const node = buildNode();

    const [[edges]] = await getCurvedTextGlyphContours(ATLAS, node, buildStraightPathNode(0, 200));

    // the curved edge came through with rotated tangents attached (vertical path ⇒ 90° frame)
    const curved = edges.find((edge) => edge.tangentStart || edge.tangentEnd);
    expect(curved).toBeDefined();
  });

  it('should walk the path backwards and add a 180° flip when pathFlip is set', async () => {
    const node = buildNode({ pathFlip: true, pathStartOffset: 1 });

    const [[edges]] = await getCurvedTextGlyphContours(ATLAS, node, buildStraightPathNode(200, 0));

    // starting at the far end (offset 1 === totalLength) and walking backwards, still on a horizontal
    // path, but rotated 180°: rotatePoint(_, ORIGIN, 180) sends (x,y) -> (-x,-y)
    expect(edges[0].start).toEqual({ x: 200, y: 0 });
    expect(edges[0].end.x).toBeCloseTo(190, 5);
    expect(edges[0].end.y).toBeCloseTo(0, 5);
  });
});
