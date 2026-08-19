// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorTangentHandles } from '../drawVectorTangentHandles';

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

describe('drawVectorTangentHandles', () => {
  beforeEach(() => {
    drawTangentHandleMock.mockClear();
  });

  it('should draw the tangentStart end of a segment when a real tangentStart is set', () => {
    // mock
    const node = buildNode({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } });

    // before
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      null,
      null,
      null,
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
    const node = buildNode({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } });

    // before
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      null,
      null,
      null,
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
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      null,
      null,
      null,
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
    const node = buildNode({
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
    });

    // before
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      { end: 'start', segmentId: 's1' },
      null,
      null,
      null,
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
    const node = buildNode({
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
    });

    // before
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      { end: 'start', segmentId: 'other-segment' },
      null,
      null,
      null,
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

  it('should mark only the selected end as selected when it matches the segment id and end', () => {
    // mock
    const node = buildNode({
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
    });

    // before
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      { end: 'end', segmentId: 's1' },
      null,
      null,
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
    const node = buildNode({
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
    });

    // before
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      { end: 'end', segmentId: 'other-segment' },
      null,
      null,
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

  it('should draw a preview handle from the Pen active vertex to the live-dragged cursor position', () => {
    // mock — no committed segments yet, just a lone active vertex being dragged
    const node = buildNode({});

    // before
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      null,
      'v1',
      { x: 30, y: 40 },
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
      node.vertices.v1,
      { x: 30, y: 40 },
      5,
      false,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw nothing extra when there is no Pen active vertex, even with a dragged handle position', () => {
    // mock
    const node = buildNode({});

    // before
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      null,
      null,
      { x: 30, y: 40 },
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).not.toHaveBeenCalled();
  });

  it('should draw nothing extra when the Pen active vertex has no live dragged handle position yet', () => {
    // mock
    const node = buildNode({});

    // before
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      null,
      'v1',
      null,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawTangentHandleMock).not.toHaveBeenCalled();
  });
});
