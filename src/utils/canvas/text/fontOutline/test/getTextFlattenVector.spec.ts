// types
import { NodeType } from 'types/design/enums';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode } from 'types/design/types';

const { getTextGlyphContours } = vi.hoisted(() => ({ getTextGlyphContours: vi.fn() }));

vi.mock('../getTextGlyphContours', () => ({ getTextGlyphContours }));

// utils
import { getTextFlattenVector } from '../getTextFlattenVector';
import { groupFilledFacesByColor } from 'utils/canvas/drawVectorNode/groupFilledFacesByColor';

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
const SQUARE = [
  { end: { x: 10, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 10, y: 10 }, start: { x: 10, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 0, y: 10 }, start: { x: 10, y: 10 }, tangentEnd: null, tangentStart: null },
  { end: { x: 0, y: 0 }, start: { x: 0, y: 10 }, tangentEnd: null, tangentStart: null },
];
const HOLE = [
  { end: { x: 8, y: 2 }, start: { x: 2, y: 2 }, tangentEnd: null, tangentStart: null },
  { end: { x: 8, y: 8 }, start: { x: 8, y: 2 }, tangentEnd: null, tangentStart: null },
  { end: { x: 2, y: 8 }, start: { x: 8, y: 8 }, tangentEnd: null, tangentStart: null },
  { end: { x: 2, y: 2 }, start: { x: 2, y: 8 }, tangentEnd: null, tangentStart: null },
];

describe('getTextFlattenVector', () => {
  it('should return null for text bound to a path', async () => {
    // action
    const result = await getTextFlattenVector(ATLAS, buildNode({ pathId: 'path-1' }));

    // result
    expect(result).toBeNull();
    expect(getTextGlyphContours).not.toHaveBeenCalled();
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
    expect(groupFilledFacesByColor(result!).get('#123456')).toHaveLength(3);
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
