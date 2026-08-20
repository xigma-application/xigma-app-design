// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawHoveredVectorSegmentHighlight } from '../drawHoveredVectorSegmentHighlight';

const drawVectorStrokeMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
};

describe('drawHoveredVectorSegmentHighlight', () => {
  beforeEach(() => {
    drawVectorStrokeMock.mockClear();
  });

  it('should draw the hovered segment in the handle-fill color at half opacity', () => {
    // before
    drawHoveredVectorSegmentHighlight(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      's1',
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      [{ points: [node.vertices.v1, node.vertices.v2], segmentId: 's1' }],
      '#0d99ff',
      2,
      200,
      150,
      IDENTITY_VIEWPORT,
      0.5,
    );
  });

  it('should draw nothing when no segment is hovered', () => {
    // before
    drawHoveredVectorSegmentHighlight(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      null,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered segment id does not belong to this node', () => {
    // before
    drawHoveredVectorSegmentHighlight(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      'missing-segment',
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });
});
