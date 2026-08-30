// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawSelectedSegmentsHighlight } from '../drawSelectedSegmentsHighlight';

const drawVectorStrokeMock = vi.fn();

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
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 }, v3: { id: 'v3', x: 20, y: 0 } },
};

describe('drawSelectedSegmentsHighlight', () => {
  beforeEach(() => {
    drawVectorStrokeMock.mockClear();
  });

  it('should draw a single selected segment in the same blue used for selected handles/vertices', () => {
    // before
    drawSelectedSegmentsHighlight(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['s1'],
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
      [{ endId: 'v2', points: [node.vertices.v1, node.vertices.v2], segmentId: 's1', startId: 'v1' }],
      '#337ae1',
      2,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should batch every selected segment into a single draw call', () => {
    // before
    drawSelectedSegmentsHighlight(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['s1', 's2'],
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock.mock.calls[0][3]).toEqual([
      { endId: 'v2', points: [node.vertices.v1, node.vertices.v2], segmentId: 's1', startId: 'v1' },
      { endId: 'v3', points: [node.vertices.v2, node.vertices.v3], segmentId: 's2', startId: 'v2' },
    ]);
  });

  it('should draw nothing when no segment is selected', () => {
    // before
    drawSelectedSegmentsHighlight(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      [],
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });

  it('should ignore a selected segment id that no longer belongs to this node', () => {
    // before
    drawSelectedSegmentsHighlight(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['missing-segment'],
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });
});
