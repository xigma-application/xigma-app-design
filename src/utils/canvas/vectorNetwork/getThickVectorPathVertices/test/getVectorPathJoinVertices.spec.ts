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

  it('should join every wedge for a branch vertex touched by 3+ segment ends, mitering only the one wedge left uncovered by every other arm', () => {
    // mock — the T-branch from getThickVectorPathVertices.spec.ts's own fan test: none of its 3
    // wedges is reflex (one is the exact-180deg collinear pass-through, the other two are plain
    // 90deg wedges already covered by the horizontal arm's own quad), so every one is a flat bevel —
    // mitering wedges that are already covered would just project a spike past the real silhouette
    // (the bug this per-wedge "only the widest, and only if reflex" gate exists to avoid)
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
    // prettier-ignore
    const expected = [
      0, 1, 0, 1, 0, -1, 0, 1, 0, -1, 0, -1,
      0, -1, -1, 0, 1, 0, 0, -1, 1, 0, 0, 1,
      1, 0, 0, -1, 0, 1, 1, 0, 0, 1, -1, 0,
    ];

    vertices.forEach((value, index) => expect(value).toBeCloseTo(expected[index]));
  });

  it('should miter only the widest (reflex) wedge for exactly 2 endpoints that are both outgoing (no incoming/outgoing pair)', () => {
    // mock — the wide (270deg) wedge on the far side gets a real miter, the narrow (90deg) one
    // between the two arms themselves gets a flat bevel
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
    // prettier-ignore
    const expected = [
      0, -1, -1, 0, 1, 0, 0, -1, 1, 0, 0, 1,
      0, 0, -1, 0, -1, -1, 0, 0, -1, -1, 0, -1,
    ];

    vertices.forEach((value, index) => expect(value).toBeCloseTo(expected[index]));
  });
});
