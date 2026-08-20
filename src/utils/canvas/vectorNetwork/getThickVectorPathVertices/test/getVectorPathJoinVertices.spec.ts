// types
import { TVertexEndpoint } from '../collectVectorPathVertexEndpoints';

// utils
import { getVectorPathJoinVertices } from '../getVectorPathJoinVertices';

describe('getVectorPathJoinVertices', () => {
  it('should skip a vertex touched by only one segment end (an open path’s own endpoint)', () => {
    // mock
    const endpointsByVertexId = new Map<string, TVertexEndpoint[]>([
      ['v1', [{ direction: 'outgoing', offset: { x: 0, y: 1 }, point: { x: 0, y: 0 } }]],
    ]);

    // action
    const vertices = getVectorPathJoinVertices(endpointsByVertexId, 1);

    // result
    expect(vertices).toEqual([]);
  });

  it('should emit a sharp-miter join for a vertex with exactly one incoming and one outgoing endpoint', () => {
    // mock — a right-angle corner: s4 arrives from above, s1 leaves to the right
    const endpointsByVertexId = new Map<string, TVertexEndpoint[]>([
      [
        'v1',
        [
          { direction: 'incoming', offset: { x: 1, y: 0 }, point: { x: 0, y: 0 } },
          { direction: 'outgoing', offset: { x: 0, y: 1 }, point: { x: 0, y: 0 } },
        ],
      ],
    ]);

    // action
    const vertices = getVectorPathJoinVertices(endpointsByVertexId, 1);

    // result — the same sharp-miter corner verified in getThickVectorPathVertices.spec.ts's square test
    const expected = [0, 0, -1, 0, -1, -1, 0, 0, -1, -1, 0, -1];

    vertices.forEach((value, index) => expect(value).toBeCloseTo(expected[index]));
  });

  it('should fall back to a bevel fan for a branch vertex touched by 3+ segment ends', () => {
    // mock — the T-branch from getThickVectorPathVertices.spec.ts's own fan test
    const endpointsByVertexId = new Map<string, TVertexEndpoint[]>([
      [
        'v1',
        [
          { direction: 'incoming', offset: { x: 0, y: 1 }, point: { x: 0, y: 0 } },
          { direction: 'outgoing', offset: { x: 0, y: 1 }, point: { x: 0, y: 0 } },
          { direction: 'outgoing', offset: { x: -1, y: 0 }, point: { x: 0, y: 0 } },
        ],
      ],
    ]);

    // action
    const vertices = getVectorPathJoinVertices(endpointsByVertexId, 1);

    // result
    const expected = [0, 0, 0, -1, 0, -1, 0, 0, 0, 1, 1, 0, 0, 0, -1, 0, 0, 1];

    vertices.forEach((value, index) => expect(value).toBeCloseTo(expected[index]));
  });

  it('should fall back to a bevel fan for exactly 2 endpoints that are both outgoing (no incoming/outgoing pair)', () => {
    // mock
    const endpointsByVertexId = new Map<string, TVertexEndpoint[]>([
      [
        'v1',
        [
          { direction: 'outgoing', offset: { x: 0, y: 1 }, point: { x: 0, y: 0 } },
          { direction: 'outgoing', offset: { x: -1, y: 0 }, point: { x: 0, y: 0 } },
        ],
      ],
    ]);

    // action
    const vertices = getVectorPathJoinVertices(endpointsByVertexId, 1);

    // result
    const expected = [0, 0, 0, 1, 1, 0, 0, 0, -1, 0, 0, -1];

    vertices.forEach((value, index) => expect(value).toBeCloseTo(expected[index]));
  });
});
