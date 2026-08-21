// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawHoveredSegmentHighlight } from '../drawHoveredSegmentHighlight';

const drawEllipseMock = vi.fn();
const drawVectorStrokeMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
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

describe('drawHoveredSegmentHighlight', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
    drawVectorStrokeMock.mockClear();
  });

  it('should draw the hovered segment in the highlight color plus a helper dot at its midpoint', () => {
    // before
    drawHoveredSegmentHighlight(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      's1',
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — the hovered segment stroke, in the highlight color
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      [{ endId: 'v2', points: [node.vertices.v1, node.vertices.v2], segmentId: 's1', startId: 'v1' }],
      '#cd4422',
      2,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — plus a helper dot at the segment's midpoint (v1 0,0 -> v2 10,0 -> 5,0), suggesting the insert point
    expect(drawEllipseMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseMock.mock.calls[0][3]).toMatchObject({ x: 2.5, y: -2.5 });
  });

  it('should draw nothing when no segment is hovered', () => {
    // before
    drawHoveredSegmentHighlight(
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
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered segment id does not belong to this node', () => {
    // before
    drawHoveredSegmentHighlight(
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
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });
});
