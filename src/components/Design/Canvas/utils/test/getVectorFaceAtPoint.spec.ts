// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFaceAtPoint } from '../getVectorFaceAtPoint';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: '#000000',
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#ffffff',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

describe('getVectorFaceAtPoint', () => {
  it('should return the face key when the point is inside a simple closed triangle', () => {
    // mock
    const node = buildNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
    );

    // result
    expect(getVectorFaceAtPoint({ x: 50, y: 40 }, node)).toBe('s1,s2,s3');
  });

  it('should return null when the point misses every face', () => {
    // mock
    const node = buildNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
    );

    // result
    expect(getVectorFaceAtPoint({ x: 500, y: 500 }, node)).toBeNull();
  });

  it('should resolve each lobe of a self-intersecting (bowtie) shape to its own distinct, independently paintable face key — Figma parity', () => {
    // mock — a 4-vertex loop whose edges (s2, s4) cross at the center without sharing a vertex there,
    // forming two visually separate triangular lobes; the crossing becomes its own new region (matches
    // how a shared edge or T-junction already splits into separate faces), so each lobe now gets its
    // own key instead of both resolving to the same whole-shape key
    const node = buildNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 100, y: 0 },
        v3: { id: 'v3', x: 0, y: 100 },
        v4: { id: 'v4', x: 100, y: 100 },
      },
    );

    // result
    const bottomLobeKey = getVectorFaceAtPoint({ x: 50, y: 10 }, node);
    const topLobeKey = getVectorFaceAtPoint({ x: 50, y: 90 }, node);

    expect(bottomLobeKey).not.toBeNull();
    expect(topLobeKey).not.toBeNull();
    expect(bottomLobeKey).not.toBe(topLobeKey);
  });
});
