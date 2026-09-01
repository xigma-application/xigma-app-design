// types
import { NodeType } from 'types/design/enums';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode } from 'types/design/types';

const { getTextGlyphContours } = vi.hoisted(() => ({ getTextGlyphContours: vi.fn() }));

vi.mock('../getTextGlyphContours', () => ({ getTextGlyphContours }));

// utils
import { getTextStrokeOutlineVector } from '../getTextStrokeOutlineVector';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

const ATLAS = {} as TGlyphAtlasJson;

const buildNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'I',
  fill: '#ffffff',
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
  strokeColor: '#000000',
  strokeWidth: 4,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const SQUARE = [
  { end: { x: 20, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 20, y: 20 }, start: { x: 20, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 0, y: 20 }, start: { x: 20, y: 20 }, tangentEnd: null, tangentStart: null },
  { end: { x: 0, y: 0 }, start: { x: 0, y: 20 }, tangentEnd: null, tangentStart: null },
];

describe('getTextStrokeOutlineVector', () => {
  it('should return null when the node has no stroke set', async () => {
    // action
    const result = await getTextStrokeOutlineVector(ATLAS, buildNode({ strokeColor: '', strokeWidth: 4 }));

    // result
    expect(result).toBeNull();
    expect(getTextGlyphContours).not.toHaveBeenCalled();
  });

  it('should return null when the node has no strokeWidth set at all', async () => {
    // action
    const result = await getTextStrokeOutlineVector(ATLAS, buildNode({ strokeWidth: undefined }));

    // result
    expect(result).toBeNull();
    expect(getTextGlyphContours).not.toHaveBeenCalled();
  });

  it('should return null for text bound to a path', async () => {
    // action
    const result = await getTextStrokeOutlineVector(ATLAS, buildNode({ pathId: 'path-1' }));

    // result
    expect(result).toBeNull();
  });

  it('should build a separate stroke band per contour, using the stroke color', async () => {
    // mock — a single glyph with one closed square contour
    getTextGlyphContours.mockResolvedValueOnce([[SQUARE]]);

    // action
    const result = await getTextStrokeOutlineVector(ATLAS, buildNode());

    // result
    expect(result?.type).toBe(NodeType.vector);
    expect(result?.fillColor).toBe('#000000');
    expect(result?.name).toBe('Text outline');
    expect(result?.parentId).toBe('frame-1');
    // one contour -> a ring-shaped stroke band, its outer and inner edge each their own face
    expect(result?.filledFaceKeys).toHaveLength(2);
    expect(groupFilledFacesForRendering(result!).find((group) => group.color === '#000000')?.polygons).toHaveLength(2);
  });

  it('should return null when there are no visible glyph contours', async () => {
    // mock
    getTextGlyphContours.mockResolvedValueOnce([]);

    // action
    const result = await getTextStrokeOutlineVector(ATLAS, buildNode({ content: '' }));

    // result
    expect(result).toBeNull();
  });
});
