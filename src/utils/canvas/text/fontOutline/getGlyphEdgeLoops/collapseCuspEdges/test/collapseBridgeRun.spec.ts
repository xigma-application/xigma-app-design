// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

// utils
import { collapseBridgeRun } from '../collapseBridgeRun';

describe('collapseBridgeRun', () => {
  it('snaps both edges to their true miter point and returns true', () => {
    const prevEdge: TLoopEdge = { end: { x: 0, y: 0 }, start: { x: -1, y: 0 }, tangentEnd: null, tangentStart: null };
    const nextEdge: TLoopEdge = { end: { x: 2, y: -1 }, start: { x: 2, y: -2 }, tangentEnd: null, tangentStart: null };

    const result = collapseBridgeRun(prevEdge, nextEdge);

    expect(result).toBe(true);
    expect(prevEdge.end).toEqual({ x: 2, y: 0 });
    expect(nextEdge.start).toEqual({ x: 2, y: 0 });
  });

  it('leaves both edges untouched and returns false when there is no miter point (parallel edges)', () => {
    const prevEdge: TLoopEdge = { end: { x: 0, y: 0 }, start: { x: -1, y: 0 }, tangentEnd: null, tangentStart: null };
    const nextEdge: TLoopEdge = { end: { x: 3, y: -2 }, start: { x: 2, y: -2 }, tangentEnd: null, tangentStart: null };
    const originalPrevEnd = prevEdge.end;
    const originalNextStart = nextEdge.start;

    const result = collapseBridgeRun(prevEdge, nextEdge);

    expect(result).toBe(false);
    expect(prevEdge.end).toBe(originalPrevEnd);
    expect(nextEdge.start).toBe(originalNextStart);
  });
});
