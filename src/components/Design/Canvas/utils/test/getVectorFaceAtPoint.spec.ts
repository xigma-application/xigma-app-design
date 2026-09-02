// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFaceAtPoint } from '../getVectorFaceAtPoint';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
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
    expect(getVectorFaceAtPoint({ x: 50, y: 40 }, node)?.key).toBe('s1,s2,s3');
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
    const bottomLobeKey = getVectorFaceAtPoint({ x: 50, y: 10 }, node)?.key;
    const topLobeKey = getVectorFaceAtPoint({ x: 50, y: 90 }, node)?.key;

    expect(bottomLobeKey).not.toBeUndefined();
    expect(topLobeKey).not.toBeUndefined();
    expect(bottomLobeKey).not.toBe(topLobeKey);
  });

  it('should return the smallest, innermost face when the point sits inside three nested rectangles drawn one inside another', () => {
    // mock — a 200x200 outer, a 140x140 middle, and a 100x100 inner rectangle, all centered on the
    // same point and drawn as three disconnected loops (no shared vertex/segment) — deriveVectorFaces
    // has no notion of a "hole", so a point inside the inner rectangle is inside all 3 plain polygons.
    // The middle rectangle also exercises the reduce's "candidate isn't smaller, keep the current
    // smallest" branch, not just "found a new smallest" every time
    const node = buildNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
        s5: { endId: 'v6', id: 's5', startId: 'v5', tangentEnd: null, tangentStart: null },
        s6: { endId: 'v7', id: 's6', startId: 'v6', tangentEnd: null, tangentStart: null },
        s7: { endId: 'v8', id: 's7', startId: 'v7', tangentEnd: null, tangentStart: null },
        s8: { endId: 'v5', id: 's8', startId: 'v8', tangentEnd: null, tangentStart: null },
        sm1: { endId: 'vm2', id: 'sm1', startId: 'vm1', tangentEnd: null, tangentStart: null },
        sm2: { endId: 'vm3', id: 'sm2', startId: 'vm2', tangentEnd: null, tangentStart: null },
        sm3: { endId: 'vm4', id: 'sm3', startId: 'vm3', tangentEnd: null, tangentStart: null },
        sm4: { endId: 'vm1', id: 'sm4', startId: 'vm4', tangentEnd: null, tangentStart: null },
      },
      {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 200, y: 0 },
        v3: { id: 'v3', x: 200, y: 200 },
        v4: { id: 'v4', x: 0, y: 200 },
        v5: { id: 'v5', x: 50, y: 50 },
        v6: { id: 'v6', x: 150, y: 50 },
        v7: { id: 'v7', x: 150, y: 150 },
        v8: { id: 'v8', x: 50, y: 150 },
        vm1: { id: 'vm1', x: 30, y: 30 },
        vm2: { id: 'vm2', x: 170, y: 30 },
        vm3: { id: 'vm3', x: 170, y: 170 },
        vm4: { id: 'vm4', x: 30, y: 170 },
      },
    );

    // result — (100,100) sits inside all 3 rectangles; the smallest, innermost one wins
    expect(getVectorFaceAtPoint({ x: 100, y: 100 }, node)?.key).toBe('s5,s6,s7,s8');
  });
});
