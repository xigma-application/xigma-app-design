// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawPenPreview } from '../drawPenPreview';

const drawVectorStrokeMock = vi.fn();
const drawEllipseMock = vi.fn();
const drawLineMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));
vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const NO_NODES: Record<string, TSceneNode> = {};

const call = (
  preview: {
    from: { x: number; y: number };
    isSnapped?: boolean;
    tangentFromOffset: { x: number; y: number } | null;
    to: { x: number; y: number };
  } | null,
  newVertexPreview: { x: number; y: number } | null,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeId: string | null,
  isDragArmable = false,
): void => {
  drawPenPreview(
    {} as WebGL2RenderingContext,
    {} as WebGLProgram,
    {} as WebGLBuffer,
    preview && { ...preview, isSnapped: preview.isSnapped ?? false },
    newVertexPreview,
    isDragArmable,
    nodes,
    vectorEditingNodeId,
    100,
    100,
    IDENTITY_VIEWPORT,
  );
};

describe('drawPenPreview', () => {
  beforeEach(() => {
    drawVectorStrokeMock.mockClear();
    drawEllipseMock.mockClear();
    drawLineMock.mockClear();
  });

  it('should draw nothing when there is no preview segment and no new-vertex preview', () => {
    // before
    call(null, null, NO_NODES, null);

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should draw a vertex-styled dot at the raw cursor position when no vector network is open yet', () => {
    // before — no preview, no editing node: just a bare cursor position ahead of the very first click,
    // which has no node/vertex to rotate around
    call(null, { x: 5, y: 5 }, NO_NODES, null);

    // result — VECTOR_VERTEX_SIZE (5) / zoom (1), styled like a real vertex dot (white fill, blue
    // border)
    expect(drawEllipseMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseMock.mock.calls[0][3]).toEqual({ fill: '#ffffff', height: 5, stroke: '#337ae1', width: 5, x: 2.5, y: 2.5 });
  });

  it('should draw both the segment preview and the new-vertex dot independently when both are present', () => {
    // before
    call({ from: { x: 0, y: 0 }, tangentFromOffset: null, to: { x: 10, y: 10 } }, { x: 50, y: 50 }, NO_NODES, null);

    // result — one dot for the segment's endpoint, one for the standalone new-vertex preview
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
  });

  it('should pivot the segment preview around the currently edited node bounds instead of the origin', () => {
    // mock — v1(0,0)/v2(10,0), 90deg around the bounds-center (5, 0): v1 -> (5, -5), v2 -> (5, 5); see
    // drawPenSegmentPreview.spec.ts for the full rotation/tangent math coverage — this only checks that
    // drawPenPreview actually derives the pivot/rotation from the editing node and forwards them
    const rotatedVectorNode: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: 'vector-1',
      name: 'Vector',
      parentId: null,
      rotation: 90,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    };
    const nodes: Record<string, TSceneNode> = { [rotatedVectorNode.id]: rotatedVectorNode };
    const preview = { from: { x: 0, y: 0 }, tangentFromOffset: null, to: { x: 10, y: 0 } };

    // before
    call(preview, null, nodes, rotatedVectorNode.id);

    // result — the stroke's endpoints must sit at the rotated positions, not the raw local ones
    const [{ points }] = drawVectorStrokeMock.mock.calls[0][3];

    expect(points[0].x).toBeCloseTo(5);
    expect(points[0].y).toBeCloseTo(-5);
    expect(points[points.length - 1].x).toBeCloseTo(5);
    expect(points[points.length - 1].y).toBeCloseTo(5);
  });

  it('should forward isDragArmable to both the segment preview and the standalone new-vertex dot', () => {
    // before
    call({ from: { x: 0, y: 0 }, tangentFromOffset: null, to: { x: 10, y: 10 } }, { x: 50, y: 50 }, NO_NODES, null, true);

    // result — both dots draw their plain ellipse as always, plus a small cross overlay each
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
    expect(drawLineMock).toHaveBeenCalledTimes(4);
  });
});
