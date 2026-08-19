// others
import {
  VECTOR_VERTEX_HOVER_SCALE,
  VECTOR_VERTEX_SELECTED_INNER_SCALE,
  VECTOR_VERTEX_SELECTED_SCALE,
  VECTOR_VERTEX_SIZE,
} from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorHandleHover } from 'types/design/canvas/types';

// utils
import { drawVectorEditHandlesLayer } from '../drawVectorEditHandlesLayer';

const drawEllipseMock = vi.fn();
const drawRectMock = vi.fn();
const drawLineMock = vi.fn();
const drawVectorStrokeMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));
vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));
vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const BASE_SIZE = VECTOR_VERTEX_SIZE;
const HOVER_SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_HOVER_SCALE;
const SELECTED_OUTER_SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_SELECTED_SCALE;
const SELECTED_INNER_SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_SELECTED_INNER_SCALE;

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

const call = (
  vectorEditingNodeId: string | null,
  selectedVertexIds: string[],
  hoveredNodeId: string | null,
  hoveredVertexId: string | null = null,
  hoveredSegmentId: string | null = null,
  penActiveVertexId: string | null = null,
  hoveredHandle: TVectorHandleHover | null = null,
  selectedHandle: TVectorHandleHover | null = null,
  penDraggedHandlePosition: { x: number; y: number } | null = null,
): void => {
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
    hoveredVertexId,
    hoveredSegmentId,
    hoveredHandle,
    selectedHandle,
    penActiveVertexId,
    penDraggedHandlePosition,
    200,
    150,
    IDENTITY_VIEWPORT,
  );
};

describe('drawVectorEditHandlesLayer', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
    drawRectMock.mockClear();
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
    expect(drawRectMock).not.toHaveBeenCalled();
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
    drawVectorEditHandlesLayer(
      gl,
      program,
      buffer,
      frameNodes,
      'frame-1',
      [],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

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

  it('should draw the hovered segment highlight when a hoveredSegmentId is given', () => {
    // before
    call(vectorNode.id, [], null, null, 's1');

    // result — the gray outline, plus the single hovered segment drawn again in the highlight color
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(2);
    expect(drawVectorStrokeMock).toHaveBeenNthCalledWith(2, {}, {}, {}, expect.anything(), '#cd4422', 2, 200, 150, IDENTITY_VIEWPORT);
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

    // result — only the tangentStart end (v1) has a handle; the tangentEnd-less end (v2) draws nothing;
    // the line uses the same gray as the edit-mode connection outline
    expect(drawLineMock).toHaveBeenCalledTimes(1);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 5, y1: 0, y2: 0 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw a selected vertex as a larger white-then-blue pair and an unselected vertex as a single default-fill dot', () => {
    // before
    call(vectorNode.id, ['v1'], null);

    // result
    const selectedOuterDot = drawEllipseMock.mock.calls.find((args) => args[3].width === SELECTED_OUTER_SIZE)?.[3];
    const selectedInnerDot = drawEllipseMock.mock.calls.find(
      (args) => args[3].fill === '#0d99ff' && args[3].width === SELECTED_INNER_SIZE,
    )?.[3];
    const unselectedDot = drawEllipseMock.mock.calls.find((args) => args[3].x === 10 - BASE_SIZE / 2)?.[3];

    expect(selectedOuterDot).toMatchObject({ fill: '#ffffff', x: -SELECTED_OUTER_SIZE / 2 });
    expect(selectedInnerDot).toMatchObject({ width: SELECTED_INNER_SIZE, x: -SELECTED_INNER_SIZE / 2 });
    expect(unselectedDot).toMatchObject({ fill: '#ffffff', width: BASE_SIZE });
  });

  it('should draw the hovered vertex larger than its unhovered neighbor', () => {
    // before
    call(vectorNode.id, [], null, 'v1');

    // result
    const vertexDrawCalls = drawEllipseMock.mock.calls.filter((args) => args[3].fill === '#ffffff');

    expect(vertexDrawCalls.find((args) => args[3].x === -HOVER_SIZE / 2)?.[3]).toMatchObject({ width: HOVER_SIZE });
    expect(vertexDrawCalls.find((args) => args[3].x === 10 - BASE_SIZE / 2)?.[3]).toMatchObject({ width: BASE_SIZE });
  });

  it('should draw the Pen tool active vertex (the segment being extended from) with the selected-style outer/inner pair', () => {
    // before
    call(vectorNode.id, [], null, null, null, 'v1');

    // result — same rendering as a real selection, even though v1 isn't in selectedVertexIds
    const selectedOuterDot = drawEllipseMock.mock.calls.find((args) => args[3].width === SELECTED_OUTER_SIZE)?.[3];
    const selectedInnerDot = drawEllipseMock.mock.calls.find(
      (args) => args[3].fill === '#0d99ff' && args[3].width === SELECTED_INNER_SIZE,
    )?.[3];

    expect(selectedOuterDot).toMatchObject({ fill: '#ffffff', x: -SELECTED_OUTER_SIZE / 2 });
    expect(selectedInnerDot).toMatchObject({ x: -SELECTED_INNER_SIZE / 2 });
  });

  it('should draw a selected tangent handle as a solid-blue line and white-then-blue diamond pair, matching the selected-vertex style', () => {
    // before
    call(vectorNode.id, [], null, null, null, null, null, { end: 'start', segmentId: 's1' });

    // result — the same enlarge/recolor treatment selected vertices get, just diamond-shaped
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 5, y1: 0, y2: 0 }, '#0d99ff', 1, 200, 150, IDENTITY_VIEWPORT);

    const outerDiamond = drawRectMock.mock.calls.find((args) => args[3].width === SELECTED_OUTER_SIZE)?.[3];
    const innerDiamond = drawRectMock.mock.calls.find((args) => args[3].fill === '#0d99ff' && args[3].width === SELECTED_INNER_SIZE)?.[3];

    expect(outerDiamond).toMatchObject({ fill: '#ffffff' });
    expect(innerDiamond).toBeDefined();
  });

  it('should deselect the tangent handle rendering once a vertex takes over the selection', () => {
    // before — selectedVertexIds non-empty, selectedHandle explicitly stale/null (mirrors the mutual-exclusivity the arm resolvers enforce)
    call(vectorNode.id, ['v1'], null, null, null, null, null, null);

    // result — the handle falls back to its plain bordered-diamond look, not the selected two-layer pair
    expect(drawRectMock).toHaveBeenCalledTimes(1);
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: BASE_SIZE, stroke: '#0d99ff', width: BASE_SIZE, x: 2.5, y: -2.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      45,
    );
  });

  it('should draw an extra tangent handle line from the Pen active vertex to the live-dragged cursor position', () => {
    // before
    call(vectorNode.id, [], null, null, null, 'v1', null, null, { x: 30, y: 40 });

    // result — the existing v1 handle line (0,0 -> 5,0) plus the new drag-preview line (0,0 -> 30,40)
    expect(drawLineMock).toHaveBeenCalledTimes(2);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 30, y1: 0, y2: 40 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
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
    drawVectorEditHandlesLayer(
      gl,
      program,
      buffer,
      rotatedNodes,
      rotatedVectorNode.id,
      ['v1'],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    const selectedDot = drawEllipseMock.mock.calls.find((args) => args[3].fill === '#0d99ff')?.[3];
    const unselectedDot = drawEllipseMock.mock.calls.find((args) => args[3].width === BASE_SIZE / IDENTITY_VIEWPORT.zoom)?.[3];

    expect(drawEllipseMock).toHaveBeenCalledTimes(3);
    expect(selectedDot.x).toBeCloseTo(5 - SELECTED_INNER_SIZE / 2);
    expect(selectedDot.y).toBeCloseTo(-5 - SELECTED_INNER_SIZE / 2);
    expect(unselectedDot.x).toBeCloseTo(5 - BASE_SIZE / 2);
    expect(unselectedDot.y).toBeCloseTo(5 - BASE_SIZE / 2);
  });
});
