// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorSegmentsInRect } from '../getVectorSegmentsInRect';

const buildNode = (segments: TVectorNode['segments']): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
});

describe('getVectorSegmentsInRect', () => {
  it('should catch a straight segment via a rect over its own middle, even though flattening only samples its two endpoints', () => {
    // mock
    const node = buildNode({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } });

    // action — nowhere near either endpoint (0,0)/(100,0), but squarely over the segment's own bounding box
    const result = getVectorSegmentsInRect(node, { height: 10, width: 10, x: 45, y: -5 });

    // result
    expect(result).toEqual(['s1']);
  });

  it('should return an empty array when the rect misses the segment entirely', () => {
    // mock
    const node = buildNode({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } });

    // action
    const result = getVectorSegmentsInRect(node, { height: 10, width: 10, x: 45, y: 50 });

    // result
    expect(result).toEqual([]);
  });

  it('should catch a curved segment whose bounding box overlaps the rect', () => {
    // mock — a curve pulled toward (20,-50) by its start tangent; with only one control point off-axis,
    // the curve's actual peak deviation lands around (35, -22) (cubic Bezier at t=1/3), well short of the
    // control point itself
    const node = buildNode({
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 20, y: -50 } },
    });

    // action
    const result = getVectorSegmentsInRect(node, { height: 20, width: 30, x: 20, y: -25 });

    // result
    expect(result).toEqual(['s1']);
  });

  it('should NOT catch a curved segment when the rect only overlaps its bounding box but never touches the actual curve', () => {
    // mock — same curve as above; for x in [90,100] the curve has already swung back close to y≈0
    // (it approaches v2 there), so a rect sitting in the bbox's far corner (y between -25 and -15) is
    // nowhere near the real path, even though it does overlap the curve's bounding box
    const node = buildNode({
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 20, y: -50 } },
    });

    // action
    const result = getVectorSegmentsInRect(node, { height: 10, width: 10, x: 90, y: -25 });

    // result
    expect(result).toEqual([]);
  });

  it('should NOT catch a diagonal straight segment when the rect sits near it but never actually crosses the line', () => {
    // mock — v1(0,0) to v2(100,100); a rect entirely above the diagonal (e.g. around (20, 60)) is
    // close to the line in bounding-box terms but never actually touches it
    const node: TVectorNode = {
      ...buildNode({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } }),
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    };

    // action
    const result = getVectorSegmentsInRect(node, { height: 10, width: 10, x: 15, y: 55 });

    // result
    expect(result).toEqual([]);
  });

  it('should catch a diagonal straight segment via a rect crossing its own middle', () => {
    // mock — same diagonal (y = x); a wide, short rect straddling it around its own midpoint (50, 50),
    // offset so the line crosses the rect's edges through their interior rather than exactly at a corner
    const node: TVectorNode = {
      ...buildNode({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } }),
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    };

    // action
    const result = getVectorSegmentsInRect(node, { height: 10, width: 20, x: 40, y: 45 });

    // result
    expect(result).toEqual(['s1']);
  });

  it('should return only the segments whose bounds actually overlap, given more than one segment', () => {
    // mock
    const node: TVectorNode = {
      ...buildNode({
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      }),
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 100, y: 500 } },
    };

    // action — over s1's span only
    const result = getVectorSegmentsInRect(node, { height: 10, width: 10, x: 45, y: -5 });

    // result
    expect(result).toEqual(['s1']);
  });
});
