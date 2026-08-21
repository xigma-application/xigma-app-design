// others
import {
  VECTOR_VERTEX_HOVER_SCALE,
  VECTOR_VERTEX_SELECTED_INNER_SCALE,
  VECTOR_VERTEX_SELECTED_SCALE,
  VECTOR_VERTEX_SIZE,
} from 'constant/canvas';

// types
import { RefObject } from 'react';
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorHandleHover, TVectorMultiSelectBox } from 'types/design/canvas/types';

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

const createVectorMultiSelectBoxRef = (): RefObject<TVectorMultiSelectBox | null> => ({ current: null });

const call = (
  vectorEditingNodeId: string | null,
  selectedVertexIds: string[],
  hoveredVertexId: string | null = null,
  hoveredSegmentId: string | null = null,
  penActiveVertexId: string | null = null,
  hoveredHandle: TVectorHandleHover | null = null,
  selectedHandles: TVectorHandleHover[] = [],
  penDraggedHandlePosition: { x: number; y: number } | null = null,
  dragOriginVertexId: string | null = null,
  selectedSegmentIds: string[] = [],
  hoveredVectorSegmentId: string | null = null,
  preMarqueeVertexIds: string[] = [],
  preMarqueeSegmentIds: string[] = [],
  hoveredVectorEdgeInsertPoint: { x: number; y: number } | null = null,
  snappedHandle: TVectorHandleHover | null = null,
  isPenDraggedHandleSnapped = false,
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
    preMarqueeVertexIds,
    selectedSegmentIds,
    preMarqueeSegmentIds,
    hoveredVertexId,
    hoveredSegmentId,
    hoveredVectorSegmentId,
    hoveredVectorEdgeInsertPoint,
    hoveredHandle,
    selectedHandles,
    snappedHandle,
    penActiveVertexId,
    dragOriginVertexId,
    penDraggedHandlePosition,
    isPenDraggedHandleSnapped,
    createVectorMultiSelectBoxRef(),
    null,
    null,
    false,
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
    call(null, []);

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
      [],
      [],
      [],
      null,
      null,
      null,
      null,
      null,
      [],
      null,
      null,
      null,
      null,
      false,
      createVectorMultiSelectBoxRef(),
      null,
      null,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });

  it('should always draw the gray edit-mode outline, even while the edited node is also the hovered node', () => {
    // before
    call(vectorNode.id, []);

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock).toHaveBeenCalledWith({}, {}, {}, expect.anything(), '#aaaaaa', 2, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw the hovered segment highlight when a hoveredSegmentId is given', () => {
    // before
    call(vectorNode.id, [], null, 's1');

    // result — the gray outline, plus the single hovered segment drawn again in the highlight color
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(2);
    expect(drawVectorStrokeMock).toHaveBeenNthCalledWith(2, {}, {}, {}, expect.anything(), '#cd4422', 2, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw the selected-segment highlight in blue when a segment is selected', () => {
    // before
    call(vectorNode.id, [], null, null, null, null, [], null, null, ['s1']);

    // result — the gray outline, plus the selected segment drawn again in the selected-state blue
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(2);
    expect(drawVectorStrokeMock).toHaveBeenNthCalledWith(2, {}, {}, {}, expect.anything(), '#0d99ff', 2, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw the hovered-vector-segment highlight in blue at half opacity when a segment is hovered by the Selection tool', () => {
    // before
    call(vectorNode.id, [], null, null, null, null, [], null, null, [], 's1');

    // result — the gray outline, plus the hovered segment drawn again in blue with alpha 0.5
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(2);
    expect(drawVectorStrokeMock).toHaveBeenNthCalledWith(2, {}, {}, {}, expect.anything(), '#0d99ff', 2, 200, 150, IDENTITY_VIEWPORT, 0.5);
  });

  it('should draw nothing for a segment’s tangent handle when its parent vertex is not selected', () => {
    // before — no vertex/handle selected at all, so the s1 tangentStart handle stays hidden
    call(vectorNode.id, []);

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
  });

  it('should draw a segment’s tangent handles once the segment itself is selected, even with no vertex selected', () => {
    // before — s1 selected directly, no vertex/handle selection at all
    call(vectorNode.id, [], null, null, null, null, [], null, null, ['s1']);

    // result — both ends of s1 reveal their handle, exactly like a directly-touched-vertex selection would
    expect(drawLineMock).toHaveBeenCalledTimes(2);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 5, y1: 0, y2: 0 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 10, x2: 7.5, y1: 0, y2: 0 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw a tangent handle line and dot for a segment end once its parent vertex is selected', () => {
    // before — v1 is the real tangentStart handle's own parent vertex
    call(vectorNode.id, ['v1']);

    // result — the real tangentStart handle at v1, plus the tangentEnd-less end's own default preview handle
    // (both draw together once either endpoint is selected — Figma's one-hop neighbor reveal); the line uses
    // the same gray as the edit-mode connection outline
    expect(drawLineMock).toHaveBeenCalledTimes(2);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 5, y1: 0, y2: 0 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 10, x2: 7.5, y1: 0, y2: 0 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw a selected vertex as a larger white-then-blue pair and an unselected vertex as a single default-fill dot', () => {
    // before
    call(vectorNode.id, ['v1']);

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
    call(vectorNode.id, [], 'v1');

    // result
    const vertexDrawCalls = drawEllipseMock.mock.calls.filter((args) => args[3].fill === '#ffffff');

    expect(vertexDrawCalls.find((args) => args[3].x === -HOVER_SIZE / 2)?.[3]).toMatchObject({ width: HOVER_SIZE });
    expect(vertexDrawCalls.find((args) => args[3].x === 10 - BASE_SIZE / 2)?.[3]).toMatchObject({ width: BASE_SIZE });
  });

  it('should draw the Pen tool active vertex (the segment being extended from) with the selected-style outer/inner pair', () => {
    // before
    call(vectorNode.id, [], null, null, 'v1');

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
    call(vectorNode.id, [], null, null, null, null, [{ end: 'start', segmentId: 's1' }]);

    // result — the same enlarge/recolor treatment selected vertices get, just diamond-shaped
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 5, y1: 0, y2: 0 }, '#0d99ff', 1, 200, 150, IDENTITY_VIEWPORT);

    const outerDiamond = drawRectMock.mock.calls.find((args) => args[3].width === SELECTED_OUTER_SIZE)?.[3];
    const innerDiamond = drawRectMock.mock.calls.find((args) => args[3].fill === '#0d99ff' && args[3].width === SELECTED_INNER_SIZE)?.[3];

    expect(outerDiamond).toMatchObject({ fill: '#ffffff' });
    expect(innerDiamond).toBeDefined();

    // result — selecting the handle must NOT make its own parent vertex (v1) render as selected too;
    // only the handle diamond gets the selected treatment, the vertex dot stays plain
    const selectedVertexDot = drawEllipseMock.mock.calls.find((args) => args[3].fill === '#0d99ff');

    expect(selectedVertexDot).toBeUndefined();
  });

  it('should draw a snapped tangent handle line in the angle-snap orange, overriding the selected-blue it would otherwise get', () => {
    // before — the same handle is both selected (drag-armed) and currently snapped, matching a real
    // in-progress angle-snapped drag
    call(
      vectorNode.id,
      [],
      null,
      null,
      null,
      null,
      [{ end: 'start', segmentId: 's1' }],
      null,
      null,
      [],
      null,
      [],
      [],
      null,
      { end: 'start', segmentId: 's1' },
    );

    // result
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 5, y1: 0, y2: 0 }, '#cd4422', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should deselect the tangent handle rendering once a vertex takes over the selection', () => {
    // before — selectedVertexIds non-empty, selectedHandles explicitly empty (mirrors the mutual-exclusivity a plain click enforces)
    call(vectorNode.id, ['v1'], null, null, null, null, []);

    // result — both handles fall back to their plain bordered-diamond look, not the selected two-layer pair;
    // v1's real handle and v2's own default preview handle both draw since v1 (either endpoint) is selected
    expect(drawRectMock).toHaveBeenCalledTimes(2);
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
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: BASE_SIZE, stroke: '#0d99ff', width: BASE_SIZE, x: 5, y: -2.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      45,
    );
  });

  it('should draw an extra tangent handle line from the Pen active vertex to the live-dragged cursor position', () => {
    // before — dragOriginVertexId mirrors penActiveVertexId here, as it does for every Pen-tool drag-armed
    // site except closing a loop (extendWithNewVertex.ts/continueVectorNetwork.ts's own-vertex branch/
    // startVectorFragment.ts's hover branch always set both to the same vertex; only closeLoopOntoVertex.ts
    // clears penActiveVertexId while the drag continues)
    call(vectorNode.id, [], null, null, 'v1', null, [], { x: 30, y: 40 }, 'v1');

    // result — the existing v1 handle line (0,0 -> 5,0), v2's own default preview handle line (10,0 -> 7.5,0,
    // now also revealed since v1 counts as selected via penActiveVertexId), plus the drag-preview line
    // (0,0 -> 30,40)
    expect(drawLineMock).toHaveBeenCalledTimes(3);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 30, y1: 0, y2: 40 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw the Pen drag-preview line in the angle-snap orange when the live drag is snapped', () => {
    // before — same setup as the plain drag-preview case above, but flagged as snapped
    call(vectorNode.id, [], null, null, 'v1', null, [], { x: 30, y: 0 }, 'v1', [], null, [], [], null, null, true);

    // result
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 30, y1: 0, y2: 0 }, '#cd4422', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should also reveal handles via the drag’s origin vertex when penActiveVertexId is null — e.g. closing a loop by dragging (penActiveVertexId is cleared before the drag continues)', () => {
    // before — penActiveVertexId null, but dragOriginVertexId is v1, mirroring closeLoopOntoVertex.ts's
    // sequence (setPenActiveVertexId(null) dispatched, then dragOriginRef armed on the same vertex)
    call(vectorNode.id, [], null, null, null, null, [], { x: 30, y: 40 }, 'v1');

    // result — same reveal as the real active-vertex case above: v1's own handle, v2's one-hop preview
    // handle, plus the live drag-preview line anchored on v1 (not silently hidden just because
    // penActiveVertexId itself reads null at this point)
    expect(drawLineMock).toHaveBeenCalledTimes(3);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 30, y1: 0, y2: 40 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw the multi-select box when 2+ vertices are selected together, with no corner handles', () => {
    // before
    call(vectorNode.id, ['v1', 'v2']);

    // result — one plain stroke rect over the bounding box of v1(0,0)/v2(10,0), no drawCornerHandles call
    const boxRect = drawRectMock.mock.calls.find((args) => args[3].height === 0 && args[3].width === 10)?.[3];

    expect(boxRect).toMatchObject({ stroke: '#0d99ff', x: 0, y: 0 });
  });

  it('should not draw the multi-select box when only a single vertex is selected', () => {
    // before
    call(vectorNode.id, ['v1']);

    // result — only the selected-vertex ellipse pair draws via drawRect... none, since vertex dots use drawEllipse;
    // the box itself must never call drawRect with the plain-box (no fill/no dot) shape
    const boxRect = drawRectMock.mock.calls.find((args) => args[3].height === 0 && args[3].width === 10);

    expect(boxRect).toBeUndefined();
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
      [],
      [],
      [],
      null,
      null,
      null,
      null,
      null,
      [],
      null,
      null,
      null,
      null,
      false,
      createVectorMultiSelectBoxRef(),
      null,
      null,
      false,
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

  it('should reveal a curved segment’s handles reached through a straight (tangent-less) connector — one-hop-by-vertex, not by-segment', () => {
    // mock — A(selected) --straight(s1, no tangent)-- B --curved(s2, real tangentStart at B)-- C; B has no
    // tangent of its own on s1, but must still count as a revealed neighbor of A so s2's handles (which
    // don't touch A directly) become visible too, matching Figma
    const chainNode: TVectorNode = {
      fillColor: null,
      id: 'chain-1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'B', id: 's1', startId: 'A', tangentEnd: null, tangentStart: null },
        s2: { endId: 'C', id: 's2', startId: 'B', tangentEnd: null, tangentStart: { x: 5, y: 0 } },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { A: { id: 'A', x: 0, y: 0 }, B: { id: 'B', x: 10, y: 0 }, C: { id: 'C', x: 20, y: 0 } },
    };
    const chainNodes: Record<string, TSceneNode> = { [chainNode.id]: chainNode };
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — only A is selected
    drawVectorEditHandlesLayer(
      gl,
      program,
      buffer,
      chainNodes,
      chainNode.id,
      ['A'],
      [],
      [],
      [],
      null,
      null,
      null,
      null,
      null,
      [],
      null,
      null,
      null,
      null,
      false,
      createVectorMultiSelectBoxRef(),
      null,
      null,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — s1 has no tangent so it draws nothing; B is one hop from A via straight s1, so s2's real
    // tangentStart handle at B draws (10,0)+(5,0)=(15,0) — but s2 does not directly touch A, so C's own end
    // stays hidden (one-hop-by-vertex reveals only B's own handle, not the far end of B's other segment)
    expect(drawLineMock).toHaveBeenCalledTimes(1);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 10, x2: 15, y1: 0, y2: 0 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
  });
});
