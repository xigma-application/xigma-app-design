// types
import { NodeType } from 'types/design/enums';
import { TEllipseArcLengthSample } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode } from 'types/design/types';

// utils
import { getOrBuildTextGeometry, TTextGeometry } from '../getOrBuildTextGeometry';

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
    const cache = new Map<string, TTextGeometry>();
    const ellipseArcLengthCache = new Map<string, TEllipseArcLengthSample[]>();

    // before
    const geometry = getOrBuildTextGeometry(ATLAS, cache, createNode(), ellipseArcLengthCache);

    // result — "AB" is two known glyphs, 6 vertices * 4 floats each, at the authored font size
    expect(geometry.vertices).toHaveLength(48);
    expect(geometry.effectiveFontSize).toBe(20);
    expect(cache.size).toBe(1);
  });

  it('should return the cached geometry on a second call with the same node, without rebuilding', () => {
    // mock
    const cache = new Map<string, TTextGeometry>();
    const ellipseArcLengthCache = new Map<string, TEllipseArcLengthSample[]>();
    const node = createNode();

    // before
    const first = getOrBuildTextGeometry(ATLAS, cache, node, ellipseArcLengthCache);
    const second = getOrBuildTextGeometry(ATLAS, cache, node, ellipseArcLengthCache);

    // result
    expect(second).toBe(first);
    expect(cache.size).toBe(1);
  });

  it('should rebuild when the node moves, since world-space positions are baked into the geometry', () => {
    // mock
    const cache = new Map<string, TTextGeometry>();
    const ellipseArcLengthCache = new Map<string, TEllipseArcLengthSample[]>();

    // before
    getOrBuildTextGeometry(ATLAS, cache, createNode({ x: 0 }), ellipseArcLengthCache);
    getOrBuildTextGeometry(ATLAS, cache, createNode({ x: 50 }), ellipseArcLengthCache);

    // result
    expect(cache.size).toBe(2);
  });

  it('should rebuild when the content changes', () => {
    // mock
    const cache = new Map<string, TTextGeometry>();
    const ellipseArcLengthCache = new Map<string, TEllipseArcLengthSample[]>();

    // before
    getOrBuildTextGeometry(ATLAS, cache, createNode({ content: 'A' }), ellipseArcLengthCache);
    getOrBuildTextGeometry(ATLAS, cache, createNode({ content: 'AB' }), ellipseArcLengthCache);

    // result
    expect(cache.size).toBe(2);
  });

  it('should build curved geometry and shrink the font size when a pathId is set and content overflows the circumference', () => {
    // mock
    const cache = new Map<string, TTextGeometry>();
    const ellipseArcLengthCache = new Map<string, TEllipseArcLengthSample[]>();
    const node = createNode({ content: 'ABABABABABABABABABABABABABABABABAB', height: 10, pathId: 'ellipse-1', width: 10 });

    // before
    const geometry = getOrBuildTextGeometry(ATLAS, cache, node, ellipseArcLengthCache);

    // result
    expect(geometry.effectiveFontSize).toBeLessThan(node.fontSize);
    expect(ellipseArcLengthCache.size).toBe(1);
  });

  it('should reuse the cached ellipse arc-length table across path-text nodes sharing the same size', () => {
    // mock
    const cache = new Map<string, TTextGeometry>();
    const ellipseArcLengthCache = new Map<string, TEllipseArcLengthSample[]>();

    // before
    getOrBuildTextGeometry(ATLAS, cache, createNode({ height: 100, id: 'a', pathId: 'ellipse-1', width: 100 }), ellipseArcLengthCache);
    getOrBuildTextGeometry(ATLAS, cache, createNode({ height: 100, id: 'b', pathId: 'ellipse-1', width: 100 }), ellipseArcLengthCache);

    // result
    expect(ellipseArcLengthCache.size).toBe(1);
  });

  it('should rebuild path-text geometry when the start offset changes', () => {
    // mock
    const cache = new Map<string, TTextGeometry>();
    const ellipseArcLengthCache = new Map<string, TEllipseArcLengthSample[]>();
    const node = createNode({ height: 100, pathId: 'ellipse-1', width: 100 });

    // before
    getOrBuildTextGeometry(ATLAS, cache, { ...node, pathStartOffset: 0 }, ellipseArcLengthCache);
    getOrBuildTextGeometry(ATLAS, cache, { ...node, pathStartOffset: 0.5 }, ellipseArcLengthCache);

    // result
    expect(cache.size).toBe(2);
  });
});
