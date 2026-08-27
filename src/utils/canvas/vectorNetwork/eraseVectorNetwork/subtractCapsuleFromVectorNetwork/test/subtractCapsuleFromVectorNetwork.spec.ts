// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../../../deriveVectorFaces/deriveVectorFaces';
import { getVectorFillColorForLoopKey } from '../../../getVectorFillColorForLoopKey';
import { getVectorFillLoopKey } from '../../../getVectorFillLoopKey';
import { getVectorFillLoopPoints } from '../../../getVectorFillLoopPoints/getVectorFillLoopPoints';
import { subtractCapsuleFromVectorNetwork } from '../subtractCapsuleFromVectorNetwork';

const buildRectSegments = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> } => ({
  segments: {
    s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
    s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
  },
  vertices: {
    a: { id: 'a', x: x1, y: y1 },
    b: { id: 'b', x: x2, y: y1 },
    c: { id: 'c', x: x2, y: y2 },
    d: { id: 'd', x: x1, y: y2 },
  },
});

const buildRectNode = (x1: number, y1: number, x2: number, y2: number, filled: boolean): TVectorNode => {
  const { segments, vertices } = buildRectSegments(x1, y1, x2, y2);
  const base: TVectorNode = {
    fillColor: null,
    filledFaceKeys: [],
    id: 'node-1',
    name: 'Vector',
    parentId: null,
    rotation: 0,
    segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  };

  if (!filled) {
    return base;
  }

  const key = getVectorFillLoopKey(deriveVectorFaces(base)[0].pieceKeys);

  return { ...base, filledFaceKeys: [key] };
};

// A densely-sampled straight dip — like real pointer-move samples during a drag, not a single dab —
// starting above `topY` and ending inside the shape at `bottomY`, at a fixed `x`.
const buildStraightDipPath = (x: number, topY: number, bottomY: number): { x: number; y: number }[] => {
  const points: { x: number; y: number }[] = [];

  for (let y = topY; y <= bottomY; y += 1) {
    points.push({ x, y });
  }

  return points;
};

const buildOpenSegmentNode = (): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 20, y: 0 } },
});

describe('subtractCapsuleFromVectorNetwork', () => {
  it('should return null when the brush misses the network entirely', () => {
    // result
    expect(subtractCapsuleFromVectorNetwork(buildOpenSegmentNode(), [{ x: 1000, y: 1000 }], 5)).toBeNull();
  });

  it('should cut a real gap in an unfilled, open segment — parity with a plain sever/drop erase', () => {
    // action — a dab in the middle of the segment, nudged slightly off-axis so the capsule's own
    // circle vertices don't land exactly on the (perfectly horizontal) line being tested
    const result = subtractCapsuleFromVectorNetwork(buildOpenSegmentNode(), [{ x: 10, y: 0.5 }], 5)!;

    // result — two stubs survive, no fill anywhere (there never was one)
    expect(result.filledFaceKeys).toEqual([]);
    const xs = Object.values(result.segments)
      .flatMap((segment) => [result.vertices[segment.startId].x, result.vertices[segment.endId].x])
      .sort((a, b) => a - b);

    expect(xs[0]).toBe(0);
    expect(xs.at(-1)).toBe(20);
    // the middle of the segment, well under the dab, is gone — a comfortable margin inside the true
    // [~5, ~15] circle-crossing range rather than its exact edge, since the capsule circle is a
    // 16-gon approximation and its actual polygon-edge crossings land a little inside the true circle
    expect(xs.some((x) => x > 7 && x < 13)).toBe(false);
  });

  it("should carve a channel out of a filled rectangle's edge without losing the fill — the reported screenshot case", () => {
    // mock — a 40x40 filled rectangle; the brush starts above the top edge and dips straight down
    // into the fill, ending well short of the far side (so the shape stays in one piece). The path's
    // y-range is nudged off whole numbers so its integer-stepped rail samples never land exactly on
    // the (whole-number) top edge — a coincidence a real, float-precision pointer-move path would
    // essentially never hit, but worth dodging explicitly in a hand-built fixture.
    const node = buildRectNode(0, 0, 40, 40, true);
    const path = buildStraightDipPath(20, -5.13, 15.13);

    // action
    const result = subtractCapsuleFromVectorNetwork(node, path, 3)!;

    // result — the fill survives (a new key resolves to real points) and the boundary picked up
    // extra vertices tracing the channel, rather than the whole fill disappearing
    expect(result).not.toBeNull();
    expect(result.filledFaceKeys).toHaveLength(1);
    const survivingNode = { ...node, segments: result.segments, vertices: result.vertices };
    const survivingPolygon = getVectorFillLoopPoints(survivingNode, result.filledFaceKeys[0]);

    expect(survivingPolygon).not.toBeNull();
    expect(survivingPolygon!.length).toBeGreaterThan(4);
    expect(Object.keys(result.segments).length).toBeGreaterThan(4);

    // result — the surviving face is pinned to the hash color of the ORIGINAL key, not its own new key
    const originalKey = node.filledFaceKeys[0];
    expect(result.fillColorOverrideByKey[result.filledFaceKeys[0]]).toBe(getVectorFillColorForLoopKey(originalKey));
  });

  it('should keep a real user-picked fill color across the carve instead of falling back to a hash color', () => {
    // mock — same 40x40 rectangle, but with an explicit paint-tool color override on its original key
    const node = buildRectNode(0, 0, 40, 40, true);
    const originalKey = node.filledFaceKeys[0];
    const paintedNode = { ...node, fillColorOverrideByKey: { [originalKey]: '#ff0000' } };
    const path = buildStraightDipPath(20, -5.13, 15.13);

    // action
    const result = subtractCapsuleFromVectorNetwork(paintedNode, path, 3)!;

    // result
    expect(result.filledFaceKeys).toHaveLength(1);
    expect(result.fillColorOverrideByKey[result.filledFaceKeys[0]]).toBe('#ff0000');
  });

  it('should leave the fill exactly as-is (no fake hole) when the brush never touches the boundary', () => {
    // mock — a 40x40 filled rectangle; the brush stays entirely inside, far from every edge
    const node = buildRectNode(0, 0, 40, 40, true);
    const path = [
      { x: 18, y: 20 },
      { x: 22, y: 20 },
    ];

    // action
    const result = subtractCapsuleFromVectorNetwork(node, path, 3)!;

    // result — the original fill survives unchanged (no second, wrong-colored loop added — see
    // deriveFilledFaceKeys.ts's own note on why a fully-interior stroke can't render a real hole), but
    // the stroke still visibly cuts: the whole capsule ring survives as bare, unfilled geometry
    expect(result).not.toBeNull();
    expect(result.filledFaceKeys).toEqual(node.filledFaceKeys);
    expect(Object.keys(result.segments).length).toBeGreaterThan(4);
    Object.keys(node.segments).forEach((id) => expect(result.segments).toHaveProperty(id));
  });

  it('should leave no surviving fill when the brush fully consumes a small filled face', () => {
    // mock — a small 10x10 filled square, brush radius large enough to cover it completely
    const node = buildRectNode(0, 0, 10, 10, true);

    // action
    const result = subtractCapsuleFromVectorNetwork(node, [{ x: 5, y: 5 }], 20)!;

    // result — the shape is genuinely gone, not silently unchanged
    expect(result).not.toBeNull();
    expect(result.filledFaceKeys).toEqual([]);
  });
});
