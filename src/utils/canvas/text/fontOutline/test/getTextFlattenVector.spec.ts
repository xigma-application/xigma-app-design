// types
import { NodeType } from 'types/design/enums';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode } from 'types/design/types';

const { getTextGlyphContours } = vi.hoisted(() => ({ getTextGlyphContours: vi.fn() }));

vi.mock('../getTextGlyphContours', () => ({ getTextGlyphContours }));

// utils
import { getTextFlattenVector } from '../getTextFlattenVector';

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
    // "I" contributes 1 face, "o" contributes 1 ring face (not 2) — 2 faces total
    expect(result?.filledFaceKeys).toHaveLength(2);
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
