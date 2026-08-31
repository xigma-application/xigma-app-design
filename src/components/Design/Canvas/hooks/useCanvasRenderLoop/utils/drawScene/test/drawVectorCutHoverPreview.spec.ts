// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs, TVectorCutSegmentHover } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorCutHoverPreview } from '../drawVectorCutHoverPreview';

const refsFor = (hoveredSegment: TVectorCutSegmentHover | null, hoveredPoint: TPoint | null): TCanvasRefs =>
  createCanvasRefs({
    hover: {
      hoveredVectorCutPointRef: { current: hoveredPoint },
      hoveredVectorCutSegmentRef: { current: hoveredSegment },
    },
  });

const getRenderedVectorNodeMock = vi.fn();
const flattenVectorSegmentsMock = vi.fn();
const drawVectorStrokeMock = vi.fn();
const drawVectorCutPointMarkerMock = vi.fn();

vi.mock('components/Design/Canvas/utils/getRenderedVectorNode', () => ({
  getRenderedVectorNode: (...args: unknown[]): unknown => getRenderedVectorNodeMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/flattenVectorSegments', () => ({
  flattenVectorSegments: (...args: unknown[]): unknown => flattenVectorSegmentsMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));
vi.mock('../drawVectorCutPointMarker', () => ({
  drawVectorCutPointMarker: (...args: unknown[]): void => drawVectorCutPointMarkerMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const node: TVectorNode = {
  fillColor: '#000000',
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#ffffff',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

const nodes: Record<string, TSceneNode> = { [node.id]: node };

describe('drawVectorCutHoverPreview', () => {
  beforeEach(() => {
    getRenderedVectorNodeMock.mockReset();
    getRenderedVectorNodeMock.mockImplementation((n: TVectorNode) => n);
    flattenVectorSegmentsMock.mockReset();
    drawVectorStrokeMock.mockClear();
    drawVectorCutPointMarkerMock.mockClear();
  });

  it('should draw nothing when neither a hovered segment nor a hovered point is given', () => {
    // before
    drawVectorCutHoverPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      refsFor(null, null),
    );

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
    expect(drawVectorCutPointMarkerMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for the segment highlight when the hovered node id no longer resolves to any node', () => {
    // before
    drawVectorCutHoverPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      refsFor({ nodeId: 'missing', segmentId: 's1' }, null),
    );

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for the segment highlight when the hovered segment id no longer matches any current segment', () => {
    // mock
    flattenVectorSegmentsMock.mockReturnValue([]);

    // before
    drawVectorCutHoverPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      refsFor({ nodeId: node.id, segmentId: 'stale' }, null),
    );

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });

  it('should stroke the whole hovered segment in the cut tool’s pink at the shared hover outline width', () => {
    // mock
    const flattenedSegment = {
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      segmentId: 's1',
    };

    flattenVectorSegmentsMock.mockReturnValue([flattenedSegment]);

    // before
    drawVectorCutHoverPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      refsFor({ nodeId: node.id, segmentId: 's1' }, null),
    );

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledWith(gl, program, buffer, [flattenedSegment], '#ff2fc2', 2, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should scale the segment highlight width down by the current zoom level', () => {
    // mock
    const flattenedSegment = {
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      segmentId: 's1',
    };

    flattenVectorSegmentsMock.mockReturnValue([flattenedSegment]);

    // before
    drawVectorCutHoverPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: { x: 0, y: 0, zoom: 2 } },
      nodes,
      refsFor({ nodeId: node.id, segmentId: 's1' }, null),
    );

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledWith(gl, program, buffer, [flattenedSegment], '#ff2fc2', 1, 200, 150, {
      x: 0,
      y: 0,
      zoom: 2,
    });
  });

  it('should draw the point marker at the hovered point, independent of whether a segment is also hovered', () => {
    // before
    drawVectorCutHoverPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      refsFor(null, { x: 25, y: 50 }),
    );

    // result
    expect(drawVectorCutPointMarkerMock).toHaveBeenCalledWith(gl, program, buffer, { x: 25, y: 50 }, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw nothing for the segment highlight when the hovered node id resolves to a non-vector node', () => {
    // mock
    const frameNode = {
      fill: '#ff0000',
      height: 10,
      id: '3',
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 10,
      x: 0,
      y: 0,
    } as TSceneNode;
    const mixedNodes: Record<string, TSceneNode> = { [frameNode.id]: frameNode };

    // before
    drawVectorCutHoverPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      mixedNodes,
      refsFor({ nodeId: frameNode.id, segmentId: 's1' }, null),
    );

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });

  it('should flatten whatever getRenderedVectorNode returns for the hovered node, not the raw node itself', () => {
    // mock
    const rotatedNode: TVectorNode = { ...node, rotation: 45 };
    const rotatedNodes: Record<string, TSceneNode> = { [rotatedNode.id]: rotatedNode };
    const renderedNode: TVectorNode = { ...rotatedNode, rotation: 0 };

    getRenderedVectorNodeMock.mockReturnValue(renderedNode);
    flattenVectorSegmentsMock.mockReturnValue([]);

    // before
    drawVectorCutHoverPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      rotatedNodes,
      refsFor({ nodeId: rotatedNode.id, segmentId: 's1' }, null),
    );

    // result
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(rotatedNode);
    expect(flattenVectorSegmentsMock).toHaveBeenCalledWith(renderedNode);
  });
});
