// types
import { NodeType } from 'types/design/enums';
import { TEllipseArcLengthSample } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode, TVectorNode } from 'types/design/types';

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

const createVector = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
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

  it('should keep the authored font size and drop the overflowing glyphs when a pathId is set and content overflows the circumference', () => {
    // mock
    const cache = new Map<string, TTextGeometry>();
    const ellipseArcLengthCache = new Map<string, TEllipseArcLengthSample[]>();
    const node = createNode({ content: 'ABABABABABABABABABABABABABABABABAB', height: 10, pathId: 'ellipse-1', width: 10 });

    // before
    const geometry = getOrBuildTextGeometry(ATLAS, cache, node, ellipseArcLengthCache);

    // result — the font size never shrinks; instead, fewer than the full 36 characters' worth of
    // glyphs (36 * 6 vertices * 4 floats each) actually get built, since the overflowing tail is
    // dropped from rendering rather than forced to fit
    expect(geometry.effectiveFontSize).toBe(node.fontSize);
    expect(geometry.vertices.length).toBeLessThan(node.content.length * 6 * 4);
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

  it('should key the cache off a bound vector’s own geometry, not just its pathId', () => {
    // mock
    const cache = new Map<string, TTextGeometry>();
    const ellipseArcLengthCache = new Map<string, TEllipseArcLengthSample[]>();
    const node = createNode({ height: 100, pathId: 'vector-1', width: 100 });

    // before — same node/pathId, but the vector's own vertices moved
    getOrBuildTextGeometry(ATLAS, cache, node, ellipseArcLengthCache, createVector());
    getOrBuildTextGeometry(
      ATLAS,
      cache,
      node,
      ellipseArcLengthCache,
      createVector({ vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 200, y: 0 } } }),
    );

    // result — the reshaped vector invalidates the cache even though nothing else changed
    expect(cache.size).toBe(2);
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
