// utils
import { collapseCuspEdges } from '../collapseCuspEdges';

// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

// Reproduces the exact W pinch pattern from a real dump: curve -> zero-length line -> short line -> curve
const loop: TLoopEdge[] = [
  {
    end: { x: 1179.9716796875, y: 573.7763671875 }, start: { x: 1179.7666015625, y: 572.68603515625 }, tangentEnd: { x: -0.06380208333333333, y: -0.37369791666666663 }, tangentStart: { x: 0.07291666666666666, y: -0.35319010416666663 },
  },
  {
    end: { x: 1179.9716796875, y: 573.7763671875 }, start: { x: 1179.9716796875, y: 573.7763671875 }, tangentEnd: null, tangentStart: null,
  },
  {
    end: { x: 1179.814453125, y: 573.7763671875 }, start: { x: 1179.9716796875, y: 573.7763671875 }, tangentEnd: null, tangentStart: null,
  },
  {
    end: { x: 1180.0263671875, y: 572.68603515625 }, start: { x: 1179.814453125, y: 573.7763671875 }, tangentEnd: { x: -0.07291666666666666, y: 0.35319010416666663 }, tangentStart: { x: 0.068359375, y: -0.37369791666666663 },
  },
  // a few more edges of typical W-stroke scale, to mimic a real ~30-40 edge glyph loop where the
  // cusp bridge is a small minority rather than half the loop (not geometrically closed, doesn't
  // matter for this test — collapseCuspEdges only compares edge lengths/directions)
  { end: { x: 1181.1, y: 571.6 }, start: { x: 1180.0263671875, y: 572.68603515625 }, tangentEnd: null, tangentStart: null },
  { end: { x: 1182.2, y: 570.5 }, start: { x: 1181.1, y: 571.6 }, tangentEnd: null, tangentStart: null },
  { end: { x: 1183.3, y: 569.4 }, start: { x: 1182.2, y: 570.5 }, tangentEnd: null, tangentStart: null },
  { end: { x: 1179.7666015625, y: 572.68603515625 }, start: { x: 1183.3, y: 569.4 }, tangentEnd: null, tangentStart: null },
];

it('collapses a near-duplicate cusp bridge into a single miter point', () => {
  const result = collapseCuspEdges(loop);

  expect(result.length).toBe(loop.length - 2);

  const curveIn = result[0];
  const curveOut = result[1];

  expect(curveIn.end).toEqual(curveOut.start);
  // the true intersection sits closer to the letter's body than the two near-duplicate points did —
  // confirmed independently earlier against a real persistVectorNetworkCrossings-resolved dump
  expect(curveIn.end.y).toBeLessThan(573.7763671875);
});

it('leaves a loop with no degenerate edges untouched', () => {
  const cleanLoop = [loop[0], loop[3], loop[4], loop[5], loop[6], loop[7]];
  const result = collapseCuspEdges(cleanLoop);

  expect(result).toEqual(cleanLoop);
});
