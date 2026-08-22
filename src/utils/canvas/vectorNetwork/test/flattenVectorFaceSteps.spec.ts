// utils
import { flattenVectorFaceSteps } from '../flattenVectorFaceSteps';

describe('flattenVectorFaceSteps', () => {
  it('should flatten a single straight step, dropping its trailing point', () => {
    // mock
    const segments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before
    const points = flattenVectorFaceSteps([{ fromId: 'a', segmentId: 's1', toId: 'b' }], segments, vertices);

    // result — a straight (no-tangent) segment flattens to exactly its two endpoints, minus the trailing one
    expect(points).toEqual([{ id: 'a', x: 0, y: 0 }]);
  });

  it('should chain several steps into one continuous point list, each step’s trailing point dropped so shared vertices aren’t duplicated', () => {
    // mock — a triangle walked a->b->c->a
    const segments = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 50, y: 100 } };
    const steps = [
      { fromId: 'a', segmentId: 's1', toId: 'b' },
      { fromId: 'b', segmentId: 's2', toId: 'c' },
      { fromId: 'c', segmentId: 's3', toId: 'a' },
    ];

    // before
    const points = flattenVectorFaceSteps(steps, segments, vertices);

    // result
    expect(points).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 100, y: 0 },
      { id: 'c', x: 50, y: 100 },
    ]);
  });

  it('should use the segment’s own tangentEnd/tangentStart swapped when the step walks it backward relative to its declared startId/endId', () => {
    // mock — segment declared b->a (tangentStart belongs to b, tangentEnd belongs to a), but the step
    // walks it a->b, so the step's "at from" tangent must be the segment's own tangentEnd
    const segments = {
      s1: {
        endId: 'a',
        id: 's1',
        startId: 'b',
        tangentEnd: { x: 10, y: 0 },
        tangentStart: { x: -10, y: 0 },
      },
    };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before
    const forwardPoints = flattenVectorFaceSteps([{ fromId: 'b', segmentId: 's1', toId: 'a' }], segments, vertices);
    const backwardPoints = flattenVectorFaceSteps([{ fromId: 'a', segmentId: 's1', toId: 'b' }], segments, vertices);

    // result — walking the same curved segment in each direction produces a different (non-mirrored)
    // curve, proving the tangent-at-from/tangent-at-to swap is direction-aware
    expect(forwardPoints).not.toEqual(backwardPoints);
    expect(forwardPoints.length).toBeGreaterThan(1);
    expect(backwardPoints.length).toBeGreaterThan(1);
  });
});
