// types
import { NodeType } from 'types/design/enums';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode, TVectorNode } from 'types/design/types';

const { getCurvedTextGlyphContours, getTextGlyphContours } = vi.hoisted(() => ({
  getCurvedTextGlyphContours: vi.fn(),
  getTextGlyphContours: vi.fn(),
}));

vi.mock('../getCurvedTextGlyphContours', () => ({ getCurvedTextGlyphContours }));
vi.mock('../getTextGlyphContours', () => ({ getTextGlyphContours }));

// utils
import { getTextFlattenVector } from '../getTextFlattenVector';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

const ATLAS = {} as TGlyphAtlasJson;

const buildNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Io',
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
  rotation: 10,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const TRIANGLE = [
  { end: { x: 10, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 5, y: 10 }, start: { x: 10, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 0, y: 0 }, start: { x: 5, y: 10 }, tangentEnd: null, tangentStart: null },
];
// offset well clear of TRIANGLE — like "I" and "o" sitting side by side in real text, distinct
// glyphs never spatially overlap, so their loops must not cross when merged into one vector
const SQUARE = [
  { end: { x: 30, y: 0 }, start: { x: 20, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 30, y: 10 }, start: { x: 30, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 20, y: 10 }, start: { x: 30, y: 10 }, tangentEnd: null, tangentStart: null },
  { end: { x: 20, y: 0 }, start: { x: 20, y: 10 }, tangentEnd: null, tangentStart: null },
];
// wound opposite to SQUARE (real TrueType/OpenType convention for a counter cut from solid ink) so
// mergeVectorNodeGeometriesWithHoleDetection records it as a genuine active hole of SQUARE, joining
// its color group, instead of an independent same-direction overlap that renders on its own
const HOLE = [
  { end: { x: 22, y: 8 }, start: { x: 22, y: 2 }, tangentEnd: null, tangentStart: null },
  { end: { x: 28, y: 8 }, start: { x: 22, y: 8 }, tangentEnd: null, tangentStart: null },
  { end: { x: 28, y: 2 }, start: { x: 28, y: 8 }, tangentEnd: null, tangentStart: null },
  { end: { x: 22, y: 2 }, start: { x: 28, y: 2 }, tangentEnd: null, tangentStart: null },
];

describe('getTextFlattenVector', () => {
  it('should return null for text bound to a path whose path node can’t be resolved', async () => {
    // action — no pathNode argument passed at all
    const result = await getTextFlattenVector(ATLAS, buildNode({ pathId: 'path-1' }));

    // result
    expect(result).toBeNull();
    expect(getTextGlyphContours).not.toHaveBeenCalled();
    expect(getCurvedTextGlyphContours).not.toHaveBeenCalled();
  });

  it('should flatten text bound to a resolvable path via the curved contour builder, not the straight one', async () => {
    // mock
    const pathNode = { id: 'path-1', type: NodeType.vector } as TVectorNode;

    getCurvedTextGlyphContours.mockResolvedValueOnce([[TRIANGLE]]);

    // action
    const result = await getTextFlattenVector(ATLAS, buildNode({ pathId: 'path-1' }), pathNode);

    // result
    expect(getCurvedTextGlyphContours).toHaveBeenCalledWith(ATLAS, expect.objectContaining({ pathId: 'path-1' }), pathNode);
    expect(getTextGlyphContours).not.toHaveBeenCalled();
    expect(result?.filledFaceKeys).toHaveLength(1);
  });

  it('should merge every glyph’s own outline (each independently faced) into one vector using the text’s fill', async () => {
    // mock — "I" (one solid contour) and "o" (an outer contour + its own hole)
    getTextGlyphContours.mockResolvedValueOnce([[TRIANGLE], [SQUARE, HOLE]]);

    // action
    const result = await getTextFlattenVector(ATLAS, buildNode());

    // result
    expect(result?.type).toBe(NodeType.vector);
    expect(result?.fillColor).toBe('#123456');
    expect(result?.parentId).toBe('frame-1');
    expect(result?.rotation).toBe(10);
    // "I" contributes 1 face, "o" contributes 2 (outer + its own hole) — 3 faces total, all
    // independently resolvable back to real points (not just present as keys)
    expect(result?.filledFaceKeys).toHaveLength(3);
    expect(groupFilledFacesForRendering(result!).find((group) => group.color === '#123456')?.polygons).toHaveLength(3);
  });

  it('should return null when there are no visible glyphs', async () => {
    // mock
    getTextGlyphContours.mockResolvedValueOnce([]);

    // action
    const result = await getTextFlattenVector(ATLAS, buildNode({ content: '' }));

    // result
    expect(result).toBeNull();
  });
});
