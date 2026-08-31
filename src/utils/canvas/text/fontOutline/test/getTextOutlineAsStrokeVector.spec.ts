// types
import { NodeType } from 'types/design/enums';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode, TVectorNode } from 'types/design/types';

const { getTextFlattenVector, getTextStrokeOutlineVector } = vi.hoisted(() => ({
  getTextFlattenVector: vi.fn(),
  getTextStrokeOutlineVector: vi.fn(),
}));

vi.mock('../getTextFlattenVector', () => ({ getTextFlattenVector }));
vi.mock('../getTextStrokeOutlineVector', () => ({ getTextStrokeOutlineVector }));

// utils
import { getTextOutlineAsStrokeVector } from '../getTextOutlineAsStrokeVector';

const ATLAS = {} as TGlyphAtlasJson;

const buildNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'I',
  fill: '#123456',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 20,
  height: 40,
  id: 'text-1',
  name: 'Text',
  parentId: 'frame-1',
  rotation: 7,
  strokeColor: '#000000',
  strokeWidth: 4,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const buildVector = (id: string): TVectorNode => ({
  fillColor: '#000000',
  filledFaceKeys: [`face-${id}`],
  fillColorOverrideByKey: { [`face-${id}`]: '#000000' },
  id,
  name: id,
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
});

describe('getTextOutlineAsStrokeVector', () => {
  it('should merge the flattened glyph fill and the stroke outline into one replacement vector', async () => {
    // mock
    getTextFlattenVector.mockResolvedValueOnce(buildVector('fill'));
    getTextStrokeOutlineVector.mockResolvedValueOnce(buildVector('stroke'));

    // action
    const result = await getTextOutlineAsStrokeVector(ATLAS, buildNode());

    // result — replaces the text node in place, carrying its id/name/parent/rotation
    expect(result?.type).toBe(NodeType.vector);
    expect(result?.id).toBe('text-1');
    expect(result?.parentId).toBe('frame-1');
    expect(result?.rotation).toBe(7);
    expect(result?.filledFaceKeys).toEqual(['face-fill', 'face-stroke']);
  });

  it('should still return a replacement vector when only the stroke part resolves', async () => {
    // mock — e.g. empty text content produces no glyph fill, but a stroke somehow still resolved
    getTextFlattenVector.mockResolvedValueOnce(null);
    getTextStrokeOutlineVector.mockResolvedValueOnce(buildVector('stroke'));

    // action
    const result = await getTextOutlineAsStrokeVector(ATLAS, buildNode());

    // result
    expect(result?.filledFaceKeys).toEqual(['face-stroke']);
  });

  it('should return null when neither part resolves', async () => {
    // mock
    getTextFlattenVector.mockResolvedValueOnce(null);
    getTextStrokeOutlineVector.mockResolvedValueOnce(null);

    // action
    const result = await getTextOutlineAsStrokeVector(ATLAS, buildNode());

    // result
    expect(result).toBeNull();
  });
});
