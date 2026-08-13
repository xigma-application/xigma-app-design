// types
import { NodeType } from 'types/design/enums';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode } from 'types/design/types';

// utils
import { getOrBuildTextGeometry } from '../getOrBuildTextGeometry';

const ATLAS: TGlyphAtlasJson = {
  chars: [
    { height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 },
    { height: 10, id: 66, width: 8, x: 8, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 },
  ],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

const createNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'AB',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 20,
  height: 20,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getOrBuildTextGeometry', () => {
  it('should build and cache geometry for a node not seen before', () => {
    // mock
    const cache = new Map<string, Float32Array>();

    // before
    const vertices = getOrBuildTextGeometry(ATLAS, cache, createNode());

    // result — "AB" is two known glyphs, 6 vertices * 4 floats each
    expect(vertices).toHaveLength(48);
    expect(cache.size).toBe(1);
  });

  it('should return the cached geometry on a second call with the same node, without rebuilding', () => {
    // mock
    const cache = new Map<string, Float32Array>();
    const node = createNode();

    // before
    const first = getOrBuildTextGeometry(ATLAS, cache, node);
    const second = getOrBuildTextGeometry(ATLAS, cache, node);

    // result
    expect(second).toBe(first);
    expect(cache.size).toBe(1);
  });

  it('should rebuild when the node moves, since world-space positions are baked into the geometry', () => {
    // mock
    const cache = new Map<string, Float32Array>();

    // before
    getOrBuildTextGeometry(ATLAS, cache, createNode({ x: 0 }));
    getOrBuildTextGeometry(ATLAS, cache, createNode({ x: 50 }));

    // result
    expect(cache.size).toBe(2);
  });

  it('should rebuild when the content changes', () => {
    // mock
    const cache = new Map<string, Float32Array>();

    // before
    getOrBuildTextGeometry(ATLAS, cache, createNode({ content: 'A' }));
    getOrBuildTextGeometry(ATLAS, cache, createNode({ content: 'AB' }));

    // result
    expect(cache.size).toBe(2);
  });
});
