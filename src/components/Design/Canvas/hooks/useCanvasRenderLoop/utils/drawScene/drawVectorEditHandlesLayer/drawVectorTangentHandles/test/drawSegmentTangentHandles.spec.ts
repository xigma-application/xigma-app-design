// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawSegmentTangentHandles } from '../drawSegmentTangentHandles';

const drawTangentHandleMock = vi.fn();

vi.mock('../drawTangentHandle', () => ({ drawTangentHandle: (...args: unknown[]): void => drawTangentHandleMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

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

  it('should draw the tangentStart end of a segment when a real tangentStart is set', () => {
    // mock
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
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — only the tangentStart end (v1) has a handle; the tangentEnd-less end (v2) draws nothing
    expect(drawTangentHandleMock).toHaveBeenCalledTimes(1);
    expect(drawTangentHandleMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node.vertices.v1,
      { x: 5, y: 0 },
      5,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
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
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });
});
