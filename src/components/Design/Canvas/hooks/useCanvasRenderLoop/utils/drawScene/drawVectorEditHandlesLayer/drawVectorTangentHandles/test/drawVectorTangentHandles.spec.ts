// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorTangentHandles } from '../drawVectorTangentHandles';

const drawSegmentTangentHandlesMock = vi.fn();
const drawPenDragHandlePreviewMock = vi.fn();

vi.mock('../drawSegmentTangentHandles', () => ({
  drawSegmentTangentHandles: (...args: unknown[]): void => drawSegmentTangentHandlesMock(...args),
}));
vi.mock('../drawPenDragHandlePreview', () => ({
  drawPenDragHandlePreview: (...args: unknown[]): void => drawPenDragHandlePreviewMock(...args),
}));

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
    drawSegmentTangentHandlesMock.mockClear();
    drawPenDragHandlePreviewMock.mockClear();
  });

  it('should draw every segment’s tangent handles once each, forwarding the shared hover/selection state and dot size', () => {
    // mock
    const node = buildNode({
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
      s2: { endId: 'v1', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
    });
    const hoveredHandle = { end: 'start' as const, segmentId: 's1' };
    const selectedHandles = [{ end: 'end' as const, segmentId: 's2' }];
    const selectedVertexIds = ['v1'];
    const oneHopVertexIds = ['v1'];

    // before
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      hoveredHandle,
      selectedHandles,
      selectedVertexIds,
      oneHopVertexIds,
      ['s2'],
      null,
      null,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawSegmentTangentHandlesMock).toHaveBeenCalledTimes(2);
    expect(drawSegmentTangentHandlesMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node,
      node.segments.s1,
      hoveredHandle,
      selectedHandles,
      selectedVertexIds,
      oneHopVertexIds,
      ['s2'],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawSegmentTangentHandlesMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node,
      node.segments.s2,
      hoveredHandle,
      selectedHandles,
      selectedVertexIds,
      oneHopVertexIds,
      ['s2'],
      5,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should always also draw the Pen drag-handle preview, with the same dot size', () => {
    // mock
    const node = buildNode({});

    // before
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      [],
      [],
      [],
      [],
      'v1',
      { x: 30, y: 40 },
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawPenDragHandlePreviewMock).toHaveBeenCalledWith({}, {}, {}, node, 'v1', { x: 30, y: 40 }, 5, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should scale the dot size down with zoom', () => {
    // mock
    const node = buildNode({});

    // before
    drawVectorTangentHandles(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      [],
      [],
      [],
      [],
      null,
      null,
      200,
      150,
      { x: 0, y: 0, zoom: 2 },
    );

    // result
    expect(drawPenDragHandlePreviewMock).toHaveBeenCalledWith({}, {}, {}, node, null, null, 2.5, 200, 150, { x: 0, y: 0, zoom: 2 });
  });
});
