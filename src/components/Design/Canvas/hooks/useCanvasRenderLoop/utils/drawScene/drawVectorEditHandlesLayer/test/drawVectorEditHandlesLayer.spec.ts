// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawVectorEditHandlesLayer } from '../drawVectorEditHandlesLayer';

const drawEllipseMock = vi.fn();
const drawLineMock = vi.fn();
const drawVectorStrokeMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));
vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const vectorNode: TVectorNode = {
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
};

const nodes: Record<string, TSceneNode> = { [vectorNode.id]: vectorNode };

const call = (vectorEditingNodeId: string | null, selectedVertexIds: string[], hoveredNodeId: string | null): void => {
  const gl = {} as WebGL2RenderingContext;
  const program = {} as WebGLProgram;
  const buffer = {} as WebGLBuffer;

  drawVectorEditHandlesLayer(
    gl,
    program,
    buffer,
    nodes,
    vectorEditingNodeId,
    selectedVertexIds,
    hoveredNodeId,
    200,
    150,
    IDENTITY_VIEWPORT,
  );
};

describe('drawVectorEditHandlesLayer', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
    drawLineMock.mockClear();
    drawVectorStrokeMock.mockClear();
  });

  it('should draw nothing when there is no node currently in Vector Edit Mode', () => {
    // before
    call(null, [], null);

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
    expect(drawLineMock).not.toHaveBeenCalled();
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when vectorEditingNodeId points at a non-vector node', () => {
    // mock
    const frameNodes: Record<string, TSceneNode> = {
      'frame-1': {
        fill: '#ff0000',
        height: 10,
        id: 'frame-1',
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      },
    };
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorEditHandlesLayer(gl, program, buffer, frameNodes, 'frame-1', [], null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });

  it('should draw the gray edit-mode outline when the edited node is not the currently hovered node', () => {
    // before
    call(vectorNode.id, [], null);

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock).toHaveBeenCalledWith({}, {}, {}, expect.anything(), '#aaaaaa', 2, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should skip the gray edit-mode outline when the edited node is the currently hovered node — the blue hover outline already covers it', () => {
    // before
    call(vectorNode.id, [], vectorNode.id);

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });

  it('should draw a tangent handle line and dot for a segment end that has a tangent', () => {
    // before
    call(vectorNode.id, [], null);

    // result — only the tangentStart end (v1) has a handle; the tangentEnd-less end (v2) draws nothing
    expect(drawLineMock).toHaveBeenCalledTimes(1);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 5, y1: 0, y2: 0 }, '#0d99ff', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw a selected-fill vertex dot for a selected vertex and a default-fill dot for an unselected one', () => {
    // before
    call(vectorNode.id, ['v1'], null);

    // result
    const vertexDrawCalls = drawEllipseMock.mock.calls.filter((args) => args[3].width === 5 / IDENTITY_VIEWPORT.zoom);

    expect(vertexDrawCalls).toHaveLength(2);
    expect(vertexDrawCalls.find((args) => args[3].x === -2.5)?.[3]).toMatchObject({ fill: '#0d99ff' });
    expect(vertexDrawCalls.find((args) => args[3].x === 7.5)?.[3]).toMatchObject({ fill: '#ffffff' });
  });

  it('should draw vertex dots at their rotated world position for a node with a persisted, not-yet-baked rotation', () => {
    // mock — v1(0,0)/v2(10,0), 90deg around the bounds-center (5, 0): v1 -> (5, -5), v2 -> (5, 5); dots
    // must track the same rotated positions the fill/stroke render at (drawVectorNode.ts), not the raw
    // stored coordinates, since baking is deferred until an actual edit starts
    const rotatedVectorNode: TVectorNode = { ...vectorNode, rotation: 90, segments: {} };
    const rotatedNodes: Record<string, TSceneNode> = { [rotatedVectorNode.id]: rotatedVectorNode };
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorEditHandlesLayer(gl, program, buffer, rotatedNodes, rotatedVectorNode.id, ['v1'], null, 200, 150, IDENTITY_VIEWPORT);

    // result
    const vertexDrawCalls = drawEllipseMock.mock.calls.filter((args) => args[3].width === 5 / IDENTITY_VIEWPORT.zoom);
    const selectedDot = vertexDrawCalls.find((args) => args[3].fill === '#0d99ff')?.[3];
    const unselectedDot = vertexDrawCalls.find((args) => args[3].fill === '#ffffff')?.[3];

    expect(vertexDrawCalls).toHaveLength(2);
    expect(selectedDot.x).toBeCloseTo(2.5);
    expect(selectedDot.y).toBeCloseTo(-7.5);
    expect(unselectedDot.x).toBeCloseTo(2.5);
    expect(unselectedDot.y).toBeCloseTo(2.5);
  });
});
