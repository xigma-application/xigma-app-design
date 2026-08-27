// utils
import { buildClosedLoopFromEdges, buildClosedVectorLoop } from '../buildClosedVectorLoop';

const SQUARE = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

describe('buildClosedVectorLoop', () => {
  it('should build a straight-edge closed loop with no rounding when radius is 0', () => {
    // action
    const { segments, vertices } = buildClosedVectorLoop(SQUARE, 0);

    // result
    expect(Object.keys(vertices)).toHaveLength(4);
    expect(Object.keys(segments)).toHaveLength(4);
    expect(Object.values(segments).every((segment) => segment.tangentStart === null && segment.tangentEnd === null)).toBe(true);
  });

  it('should form a single closed cycle covering every vertex exactly once', () => {
    // action
    const { segments, vertices } = buildClosedVectorLoop(SQUARE, 0);

    // result
    const vertexIds = Object.keys(vertices);
    const visited = new Set<string>();
    let currentId = vertexIds[0];

    for (let step = 0; step < vertexIds.length; step += 1) {
      visited.add(currentId);
      const outgoing = Object.values(segments).find((segment) => segment.startId === currentId);

      expect(outgoing).toBeDefined();
      currentId = outgoing!.endId;
    }

    expect(visited.size).toBe(vertexIds.length);
    expect(currentId).toBe(vertexIds[0]);
  });

  it('should round every corner and connect the rounded corners with straight edges when radius is positive', () => {
    // action
    const { segments, vertices } = buildClosedVectorLoop(SQUARE, 20);

    // result — 4 corners x 1 curve each (90deg sweep) + 4 connecting straight edges
    expect(Object.keys(vertices)).toHaveLength(8);
    expect(Object.keys(segments)).toHaveLength(8);

    const curvedSegments = Object.values(segments).filter((segment) => segment.tangentStart !== null);
    const straightSegments = Object.values(segments).filter((segment) => segment.tangentStart === null);

    expect(curvedSegments).toHaveLength(4);
    expect(straightSegments).toHaveLength(4);
  });
});

describe('buildClosedLoopFromEdges', () => {
  it('should chain edges into vertices whose positions match each edge start point', () => {
    // mock
    const edges = [
      { end: { x: 10, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null },
      { end: { x: 0, y: 0 }, start: { x: 10, y: 0 }, tangentEnd: null, tangentStart: null },
    ];

    // action
    const { segments, vertices } = buildClosedLoopFromEdges(edges);

    // result
    const positions = Object.values(vertices).map((vertex) => ({ x: vertex.x, y: vertex.y }));

    expect(positions).toEqual(
      expect.arrayContaining([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ]),
    );
    expect(Object.keys(segments)).toHaveLength(2);
  });
});
