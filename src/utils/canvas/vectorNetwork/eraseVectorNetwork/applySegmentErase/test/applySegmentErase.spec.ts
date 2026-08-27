// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { applySegmentErase } from '../applySegmentErase';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
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
});

// a straight segment a(0,0) -> b(100,0)
const straightNode = (): TVectorNode =>
  buildNode(
    { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
    { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
  );

describe('applySegmentErase', () => {
  it('should drop a fully-covered segment outright', () => {
    // action
    const result = applySegmentErase(straightNode(), 's1', { kind: 'whole' });

    // result
    expect(result.segments).toEqual({});
  });

  it('should keep only the far side when the brush covers the segment start', () => {
    // action — erase [0, 0.3]
    const result = applySegmentErase(straightNode(), 's1', { kind: 'start', tOut: 0.3 });
    const [remaining] = Object.values(result.segments);

    // result — one segment left, running from the new (30,0) split point to b
    expect(Object.keys(result.segments)).toHaveLength(1);
    expect(remaining.endId).toBe('b');
    expect(result.vertices[remaining.startId]).toMatchObject({ x: 30, y: 0 });
  });

  it('should keep only the near side when the brush covers the segment end', () => {
    // action — erase [0.7, 1]
    const result = applySegmentErase(straightNode(), 's1', { kind: 'end', tIn: 0.7 });

    // result — s1 survives, now ending at the new (70,0) split point
    expect(Object.keys(result.segments)).toEqual(['s1']);
    expect(result.segments.s1.startId).toBe('a');
    expect(result.vertices[result.segments.s1.endId]).toMatchObject({ x: 70, y: 0 });
  });

  it('should leave a gap with two new endpoints when the brush cuts the interior', () => {
    // action — erase [0.3, 0.7]
    const result = applySegmentErase(straightNode(), 's1', { kind: 'middle', tIn: 0.3, tOut: 0.7 });
    const xs = Object.values(result.segments)
      .flatMap((segment) => [result.vertices[segment.startId].x, result.vertices[segment.endId].x])
      .sort((a, b) => a - b);

    // result — [a..30] and [70..b], the [30,70] stretch gone
    expect(Object.keys(result.segments)).toHaveLength(2);
    expect(xs).toEqual([0, 30, 70, 100]);
  });

  it('should fall back to the first cut when an "end" erase lands exactly on the endpoint', () => {
    // action — degenerate: severing at t=1 mints no new segment to drop
    const result = applySegmentErase(straightNode(), 's1', { kind: 'end', tIn: 1 });

    // result — still a single segment, its end relabelled to a fresh coincident vertex
    expect(Object.keys(result.segments)).toEqual(['s1']);
    expect(result.segments.s1.endId).not.toBe('b');
  });

  it('should fall back to the first cut when a "middle" erase starts exactly at the segment start', () => {
    // action — degenerate: severing at t=0 mints no far segment to work on
    const result = applySegmentErase(straightNode(), 's1', { kind: 'middle', tIn: 0, tOut: 0.5 });

    // result
    expect(Object.keys(result.segments)).toEqual(['s1']);
    expect(result.segments.s1.startId).not.toBe('a');
  });
});
