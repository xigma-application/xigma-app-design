// types
import { NodeType } from 'types/design/enums';
import { TPenPointHoverContext } from '../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { resolveActiveVertexHover } from '../resolveActiveVertexHover';
import { resolveEdgePointHover } from '../resolveEdgePointHover';
import { resolveVertexPointHover } from '../resolveVertexPointHover';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
};

const createContext = (overrides: Partial<TPenPointHoverContext> = {}): TPenPointHoverContext => ({
  node,
  point: { x: 900, y: 900 },
  viewport: IDENTITY_VIEWPORT,
  ...overrides,
});

describe('resolveActiveVertexHover', () => {
  it('should return the active-vertex hover kind and its own point when hovering back onto the excluded (active) vertex', () => {
    // result — hovering right on v1, the vertex currently being extended from
    expect(resolveActiveVertexHover(createContext({ excludeVertexId: 'v1', point: { x: 0, y: 0 } }))).toEqual({
      hoverKind: 'active-vertex',
      point: { id: 'v1', x: 0, y: 0 },
      segmentId: null,
    });
  });

  it('should return undefined when no vertex is excluded (idle, no active vertex yet)', () => {
    // result
    expect(resolveActiveVertexHover(createContext({ point: { x: 0, y: 0 } }))).toBeUndefined();
  });

  it('should return undefined when hovering a different vertex than the excluded one', () => {
    // result — hovering v2 while v1 is the active/excluded vertex
    expect(resolveActiveVertexHover(createContext({ excludeVertexId: 'v1', point: { x: 100, y: 0 } }))).toBeUndefined();
  });

  it('should return undefined when far from the excluded vertex', () => {
    // result
    expect(resolveActiveVertexHover(createContext({ excludeVertexId: 'v1', point: { x: 900, y: 900 } }))).toBeUndefined();
  });
});

describe('resolveVertexPointHover', () => {
  it('should return the vertex hover kind and its point when hovering close enough to an existing vertex', () => {
    // result — pointer hovers a couple of px away from v1, well within the snap radius
    expect(resolveVertexPointHover(createContext({ point: { x: 2, y: 1 } }))).toEqual({
      hoverKind: 'vertex',
      point: { id: 'v1', x: 0, y: 0 },
      segmentId: null,
    });
  });

  it('should return undefined when no vertex is nearby', () => {
    // result
    expect(resolveVertexPointHover(createContext({ point: { x: 900, y: 900 } }))).toBeUndefined();
  });

  it('should return undefined when the only vertex nearby is the excluded one', () => {
    // result — hovering right on v1, which is excluded (e.g. the active vertex being extended from)
    expect(resolveVertexPointHover(createContext({ excludeVertexId: 'v1', point: { x: 0, y: 0 } }))).toBeUndefined();
  });
});

describe('resolveEdgePointHover', () => {
  it('should return the plain edge hover kind and the continuous projected point when hovering the interior away from the midpoint', () => {
    // result — pointer hovers near s1's (v1 0,0 -> v2 100,0) far end, well outside the midpoint's snap radius
    expect(resolveEdgePointHover(createContext({ point: { x: 90, y: 2 } }))).toEqual({
      hoverKind: 'edge',
      point: { x: 90, y: 0 },
      segmentId: 's1',
    });
  });

  it('should return the edge-snap hover kind and lock onto the exact midpoint when hovering close enough to it', () => {
    // result — pointer hovers a few px off s1's midpoint (v1 0,0 -> v2 100,0 -> midpoint 50,0)
    expect(resolveEdgePointHover(createContext({ point: { x: 50, y: 2 } }))).toEqual({
      hoverKind: 'edge-snap',
      point: { x: 50, y: 0 },
      segmentId: 's1',
    });
  });

  it('should return undefined when the point is near a vertex instead of a segment interior', () => {
    // result
    expect(resolveEdgePointHover(createContext({ point: { x: 0.5, y: 0 } }))).toBeUndefined();
  });

  it('should return undefined when no segment is nearby', () => {
    // result
    expect(resolveEdgePointHover(createContext({ point: { x: 900, y: 900 } }))).toBeUndefined();
  });
});
