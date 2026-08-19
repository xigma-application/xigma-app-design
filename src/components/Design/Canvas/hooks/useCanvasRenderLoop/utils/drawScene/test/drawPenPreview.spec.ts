// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawPenPreview } from '../drawPenPreview';

const drawVectorStrokeMock = vi.fn();
const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));
vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const NO_NODES: Record<string, TSceneNode> = {};

const call = (
  preview: { from: { x: number; y: number }; tangentFromOffset: { x: number; y: number } | null; to: { x: number; y: number } } | null,
  hoverVertex: { nodeId: string; point: { x: number; y: number }; vertexId: string } | null,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeId: string | null,
): void => {
  drawPenPreview(
    {} as WebGL2RenderingContext,
    {} as WebGLProgram,
    {} as WebGLBuffer,
    preview,
    hoverVertex,
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
  });

  it('should draw nothing when there is no preview segment and no hover vertex', () => {
    // before
    call(null, null, NO_NODES, null);

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should draw a vector stroke for the preview segment from the pen origin to the pointer', () => {
    // mock
    const preview = { from: { x: 0, y: 0 }, tangentFromOffset: null, to: { x: 10, y: 10 } };

    // before
    call(preview, null, NO_NODES, null);

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock.mock.calls[0][3]).toEqual([
      {
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        segmentId: 'preview',
      },
    ]);
  });

  it('should draw a snap-indicator ellipse centered on the hovered vertex', () => {
    // mock
    const hoverVertex = { nodeId: 'node', point: { x: 5, y: 5 }, vertexId: 'vertex' };

    // before
    call(null, hoverVertex, NO_NODES, null);

    // result — VECTOR_SNAP_INDICATOR_RADIUS_PX (8) / zoom (1)
    expect(drawEllipseMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseMock.mock.calls[0][3]).toEqual({ height: 16, stroke: '#0d99ff', width: 16, x: -3, y: -3 });
  });

  it('should draw both the preview stroke and the snap-indicator ellipse together', () => {
    // mock
    const preview = { from: { x: 0, y: 0 }, tangentFromOffset: null, to: { x: 10, y: 10 } };
    const hoverVertex = { nodeId: 'node', point: { x: 10, y: 10 }, vertexId: 'vertex' };

    // before
    call(preview, hoverVertex, NO_NODES, null);

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseMock).toHaveBeenCalledTimes(1);
  });

  it('should rotate the preview stroke and snap-indicator around the edited node rotation, matching where the real vertices render', () => {
    // mock — v1(0,0)/v2(10,0), 90deg around the bounds-center (5, 0): v1 -> (5, -5), v2 -> (5, 5), the
    // same math the vertex dots use (drawVectorEditHandlesLayer), so the in-progress preview lands on
    // top of them instead of drawing at the raw, un-rotated local coordinates
    const rotatedVectorNode: TVectorNode = {
      fillColor: null,
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
    const hoverVertex = { nodeId: rotatedVectorNode.id, point: { x: 10, y: 0 }, vertexId: 'v2' };

    // before
    call(preview, hoverVertex, nodes, rotatedVectorNode.id);

    // result — the stroke's endpoints must sit at the rotated positions, not the raw local ones
    const [{ points }] = drawVectorStrokeMock.mock.calls[0][3];

    expect(points[0].x).toBeCloseTo(5);
    expect(points[0].y).toBeCloseTo(-5);
    expect(points[points.length - 1].x).toBeCloseTo(5);
    expect(points[points.length - 1].y).toBeCloseTo(5);

    // result — the snap-indicator ellipse must be centered on the rotated hover vertex (5, 5), not (10, 0)
    const ellipseArgs = drawEllipseMock.mock.calls[0][3];

    expect(ellipseArgs.x + ellipseArgs.width / 2).toBeCloseTo(5);
    expect(ellipseArgs.y + ellipseArgs.height / 2).toBeCloseTo(5);
  });

  it('should curve the preview through a dragged outgoing tangent, rotating it as a direction vector around the origin, not around the node pivot', () => {
    // mock — v1(0,0)/v2(10,0), 90deg around the bounds-center (5, 0): from -> (5, -5), to -> (5, 5);
    const rotatedVectorNode: TVectorNode = {
      fillColor: null,
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
    const preview = { from: { x: 0, y: 0 }, tangentFromOffset: { x: 5, y: 0 }, to: { x: 10, y: 0 } };

    // before
    call(preview, null, nodes, rotatedVectorNode.id);

    // result — a curved (tangent-shaped) preview subdivides into VECTOR_CURVE_SEGMENTS (24) + 1 points,
    const [{ points }] = drawVectorStrokeMock.mock.calls[0][3];

    expect(points).toHaveLength(25);
    expect(points[0].x).toBeCloseTo(5);
    expect(points[0].y).toBeCloseTo(-5);
    expect(points[points.length - 1].x).toBeCloseTo(5);
    expect(points[points.length - 1].y).toBeCloseTo(5);
  });
});
