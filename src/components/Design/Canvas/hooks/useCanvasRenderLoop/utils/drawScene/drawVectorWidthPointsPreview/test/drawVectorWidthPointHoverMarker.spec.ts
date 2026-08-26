// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawVectorWidthPointHoverMarker } from '../drawVectorWidthPointHoverMarker';

const getRenderedVectorNodeMock = vi.fn();
const getVectorSegmentPointAtTMock = vi.fn();
const drawVectorCutPointMarkerMock = vi.fn();

vi.mock('components/Design/Canvas/utils/getRenderedVectorNode', () => ({
  getRenderedVectorNode: (...args: unknown[]): unknown => getRenderedVectorNodeMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorSegmentPointAtT', () => ({
  getVectorSegmentPointAtT: (...args: unknown[]): unknown => getVectorSegmentPointAtTMock(...args),
}));
vi.mock('../../drawVectorCutPointMarker', () => ({
  drawVectorCutPointMarker: (...args: unknown[]): void => drawVectorCutPointMarkerMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#000',
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('drawVectorWidthPointHoverMarker', () => {
  beforeEach(() => {
    getRenderedVectorNodeMock.mockReset();
    getRenderedVectorNodeMock.mockImplementation((n: TVectorNode) => n);
    getVectorSegmentPointAtTMock.mockReset();
    drawVectorCutPointMarkerMock.mockClear();
  });

  it('should draw nothing when there is no hovered point', () => {
    // before
    drawVectorWidthPointHoverMarker(gl, program, buffer, {}, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorCutPointMarkerMock).not.toHaveBeenCalled();
  });

  it('should draw a marker at the hovered stroke position', () => {
    // mock
    const node = buildNode();
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    getVectorSegmentPointAtTMock.mockReturnValue({ x: 9, y: 9 });

    // before
    drawVectorWidthPointHoverMarker(gl, program, buffer, nodes, { nodeId: node.id, segmentId: 's1', t: 0.5 }, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorCutPointMarkerMock).toHaveBeenCalledWith(gl, program, buffer, { x: 9, y: 9 }, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should skip drawing when the hovered node id no longer resolves to any node', () => {
    // before
    drawVectorWidthPointHoverMarker(gl, program, buffer, {}, { nodeId: 'missing', segmentId: 's1', t: 0.5 }, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorCutPointMarkerMock).not.toHaveBeenCalled();
  });

  it('should resolve the hover position from whatever getRenderedVectorNode returns for the node, not the raw node itself', () => {
    // mock
    const rotatedNode = buildNode({ rotation: 45 });
    const nodes: Record<string, TSceneNode> = { [rotatedNode.id]: rotatedNode };
    const renderedNode: TVectorNode = { ...rotatedNode, rotation: 0 };

    getRenderedVectorNodeMock.mockReturnValue(renderedNode);
    getVectorSegmentPointAtTMock.mockReturnValue({ x: 9, y: 9 });

    // before
    drawVectorWidthPointHoverMarker(
      gl,
      program,
      buffer,
      nodes,
      { nodeId: rotatedNode.id, segmentId: 's1', t: 0.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(rotatedNode);
    expect(getVectorSegmentPointAtTMock).toHaveBeenCalledWith(renderedNode, renderedNode.segments.s1, 0.5);
  });
});
