// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawSegmentTangentHandles } from '../drawSegmentTangentHandles';

const drawTangentHandleMock = vi.fn();

vi.mock('../drawTangentHandle', () => ({ drawTangentHandle: (...args: unknown[]): void => drawTangentHandleMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOTH_VERTICES_SELECTED = ['v1', 'v2'];

const buildNode = (segments: TVectorNode['segments']): TVectorNode => ({
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
});

describe('drawSegmentTangentHandles', () => {
  beforeEach(() => {
    drawTangentHandleMock.mockClear();
  });

  it('should draw both ends of a segment when only tangentStart is real — the tangentEnd side falls back to its own default preview', () => {
    // mock — v1(0,0) -> v2(10,0), tangentStart (5,0); the default tangentEnd preview mirrors it: direction
    // toward the shared point is (v1-v2)+tangentStart=(-5,0), scaled to half of tangentStart's own length
    // (2.5) — drawn as v2 + that offset = (7.5, 0)
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      null,
      [],
      null,
      BOTH_VERTICES_SELECTED,
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — both ends now draw a handle, but the segment's own tangentEnd is untouched
    expect(drawTangentHandleMock).toHaveBeenCalledTimes(2);
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v1,
      { x: 5, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v2,
      { x: 7.5, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(segment.tangentEnd).toBeNull();
  });

  it('should draw nothing for a straight segment with no tangents on either end', () => {
    // mock
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      null,
      [],
      null,
      BOTH_VERTICES_SELECTED,
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).not.toHaveBeenCalled();
  });

  it('should draw a default preview handle for the tangentStart end when only tangentEnd is set, without mutating the segment', () => {
    // mock — v1(0,0) -> v2(10,0), tangentEnd (-2,0); direction toward the shared point is (10,0)+(-2,0)=(8,0),
    // scaled to half of tangentEnd's own length (1) lands the default handle at (1,0)
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -2, y: 0 }, tangentStart: null };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      null,
      [],
      null,
      BOTH_VERTICES_SELECTED,
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — both ends now draw a handle, but the segment's own tangentStart is untouched
    expect(drawTangentHandleMock).toHaveBeenCalledTimes(2);
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v1,
      { x: 1, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v2,
      { x: 8, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(segment.tangentStart).toBeNull();
  });

  it('should mark only the hovered end as hovered when it matches the segment id and end', () => {
    // mock
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      { end: 'start', segmentId: 's1' },
      [],
      null,
      BOTH_VERTICES_SELECTED,
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v1,
      { x: 5, y: 0 },
      5,
      true,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v2,
      { x: 5, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should not mark any end as hovered when the hovered handle belongs to a different segment', () => {
    // mock
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      { end: 'start', segmentId: 'other-segment' },
      [],
      null,
      BOTH_VERTICES_SELECTED,
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v1,
      { x: 5, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v2,
      { x: 5, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should mark only the selected end as selected when it is among the selected handles', () => {
    // mock
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      null,
      [{ end: 'end', segmentId: 's1' }],
      null,
      BOTH_VERTICES_SELECTED,
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v1,
      { x: 5, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v2,
      { x: 5, y: 0 },
      5,
      false,
      true,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should not mark any end as selected when the selected handle belongs to a different segment', () => {
    // mock
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      null,
      [{ end: 'end', segmentId: 'other-segment' }],
      null,
      BOTH_VERTICES_SELECTED,
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v2,
      { x: 5, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw both ends of a segment once the segment itself is selected, even with no vertex/handle selected', () => {
    // mock
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      null,
      [],
      null,
      [],
      [],
      ['s1'],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).toHaveBeenCalledTimes(2);
  });

  it('should draw neither end when no vertex is selected and neither handle is itself selected', () => {
    // mock
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      null,
      [],
      null,
      [],
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).not.toHaveBeenCalled();
  });

  it('should draw both ends of a segment when just its start vertex is selected — the neighbor end also reveals (Figma one-hop parity)', () => {
    // mock
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      null,
      [],
      null,
      ['v1'],
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — v1 is only the start vertex, yet the end handle (attached to the neighbor v2) also draws
    expect(drawTangentHandleMock).toHaveBeenCalledTimes(2);
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v1,
      { x: 5, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v2,
      { x: 5, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw both ends of a segment when just its end vertex is selected — the neighbor end also reveals', () => {
    // mock
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      null,
      [],
      null,
      ['v2'],
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — v2 is only the end vertex, yet the start handle (attached to the neighbor v1) also draws
    expect(drawTangentHandleMock).toHaveBeenCalledTimes(2);
  });

  it('should still draw an end that is itself selected even when its parent vertex is not selected', () => {
    // mock — the end handle was selected directly; no vertex is selected at all
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      null,
      [{ end: 'end', segmentId: 's1' }],
      null,
      [],
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).toHaveBeenCalledTimes(1);
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v2,
      { x: 5, y: 0 },
      5,
      false,
      true,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should mark only the end matching the snapped handle as snapped, leaving the other end unsnapped', () => {
    // mock
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      null,
      [],
      { end: 'start', segmentId: 's1' },
      BOTH_VERTICES_SELECTED,
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v1,
      { x: 5, y: 0 },
      5,
      false,
      false,
      true,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v2,
      { x: 5, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should not mark any end as snapped when the snapped handle belongs to a different segment', () => {
    // mock
    const segment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } };
    const node = buildNode({ s1: segment });

    // before
    drawSegmentTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      segment,
      null,
      [],
      { end: 'start', segmentId: 'other-segment' },
      BOTH_VERTICES_SELECTED,
      [],
      [],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v1,
      { x: 5, y: 0 },
      5,
      false,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });
});
