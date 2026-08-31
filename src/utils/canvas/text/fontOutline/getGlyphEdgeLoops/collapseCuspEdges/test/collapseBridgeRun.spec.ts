// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

// utils
import { collapseBridgeRun } from '../collapseBridgeRun';

describe('collapseBridgeRun', () => {
  it('snaps both edges to their true miter point and returns true', () => {
    const prevEdge: TLoopEdge = { start: { x: -1, y: 0 }, end: { x: 0, y: 0 }, tangentStart: null, tangentEnd: null };
    const nextEdge: TLoopEdge = { start: { x: 2, y: -2 }, end: { x: 2, y: -1 }, tangentStart: null, tangentEnd: null };

    const result = collapseBridgeRun(prevEdge, nextEdge);

    expect(result).toBe(true);
    expect(prevEdge.end).toEqual({ x: 2, y: 0 });
    expect(nextEdge.start).toEqual({ x: 2, y: 0 });
  });

  it('leaves both edges untouched and returns false when there is no miter point (parallel edges)', () => {
    const prevEdge: TLoopEdge = { start: { x: -1, y: 0 }, end: { x: 0, y: 0 }, tangentStart: null, tangentEnd: null };
    const nextEdge: TLoopEdge = { start: { x: 2, y: -2 }, end: { x: 3, y: -2 }, tangentStart: null, tangentEnd: null };
    const originalPrevEnd = prevEdge.end;
    const originalNextStart = nextEdge.start;

    const result = collapseBridgeRun(prevEdge, nextEdge);

    expect(result).toBe(false);
    expect(prevEdge.end).toBe(originalPrevEnd);
    expect(nextEdge.start).toBe(originalNextStart);
  });
});
