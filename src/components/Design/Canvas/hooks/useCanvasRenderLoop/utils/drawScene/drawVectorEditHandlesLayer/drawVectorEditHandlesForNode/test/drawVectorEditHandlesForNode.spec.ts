// others
import {
  VECTOR_VERTEX_HOVER_SCALE,
  VECTOR_VERTEX_SELECTED_INNER_SCALE,
  VECTOR_VERTEX_SELECTED_SCALE,
  VECTOR_VERTEX_SIZE,
} from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVertexDotBufferCacheEntry } from '../../drawVectorVertexDots/types';

// utils
import { drawVectorEditHandlesForNode } from '../drawVectorEditHandlesForNode';

const drawEllipseMock = vi.fn();
const drawRectMock = vi.fn();
const drawLineMock = vi.fn();
const drawVectorStrokeMock = vi.fn();
const drawVectorVertexDotBatchMock = vi.fn();
const drawVectorThickStrokeVerticesMock = vi.fn();
const getVectorNodeThickStrokeVerticesMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));
vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));
vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorThickStrokeVertices', () => ({
  drawVectorThickStrokeVertices: (...args: unknown[]): void => drawVectorThickStrokeVerticesMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices', () => ({
  getVectorNodeThickStrokeVertices: (...args: unknown[]): unknown => getVectorNodeThickStrokeVerticesMock(...args),
}));
vi.mock(
  'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawVectorEditHandlesLayer/drawVectorVertexDots/drawVectorVertexDotBatch',
  () => ({ drawVectorVertexDotBatch: (...args: unknown[]): void => drawVectorVertexDotBatchMock(...args) }),
);

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const BASE_SIZE = VECTOR_VERTEX_SIZE;
const HOVER_SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_HOVER_SCALE;
const SELECTED_OUTER_SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_SELECTED_SCALE;
const SELECTED_INNER_SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_SELECTED_INNER_SCALE;

const vectorNode: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
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

const call = (
  node: TVectorNode,
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
  newVertexIds: Set<string> = new Set(),
): void => {
  const gl = {} as WebGL2RenderingContext;
  const program = {} as WebGLProgram;
  const buffer = {} as WebGLBuffer;
  const vertexDotBufferCache = new WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>();

  drawVectorEditHandlesForNode(
    gl,
    program,
    buffer,
    vertexDotBufferCache,
    node,
    selectedVertexIds,
    preMarqueeVertexIds,
    selectedSegmentIds,
    preMarqueeSegmentIds,
    hoveredVertexId,
    newVertexIds,
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
    200,
    150,
    IDENTITY_VIEWPORT,
  );
};

describe('drawVectorEditHandlesForNode', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
    drawRectMock.mockClear();
    drawLineMock.mockClear();
    drawVectorStrokeMock.mockClear();
    drawVectorVertexDotBatchMock.mockClear();
    drawVectorThickStrokeVerticesMock.mockClear();
    getVectorNodeThickStrokeVerticesMock.mockReset();
    getVectorNodeThickStrokeVerticesMock.mockReturnValue([]);
  });

  it('should always draw the gray edit-mode outline, even while the edited node is also the hovered node', () => {
    // before
    call(vectorNode, []);

    // result — the outline goes through getVectorNodeThickStrokeVertices/drawVectorThickStrokeVertices
    // directly now, not the general-purpose drawVectorStroke helper
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
    expect(getVectorNodeThickStrokeVerticesMock).toHaveBeenCalledWith(vectorNode, 1);
    expect(drawVectorThickStrokeVerticesMock).toHaveBeenCalledTimes(1);
    expect(drawVectorThickStrokeVerticesMock).toHaveBeenCalledWith({}, {}, {}, null, [], '#aaaaaa', 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw the hovered segment highlight when a hoveredSegmentId is given', () => {
    // before
    call(vectorNode, [], null, 's1');

    // result — the gray outline goes through the thick-stroke-vertices path; the single hovered
    // segment is still drawn via drawVectorStroke, in the highlight color
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock).toHaveBeenCalledWith({}, {}, {}, expect.anything(), '#cd4422', 2, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw the selected-segment highlight in blue when a segment is selected', () => {
    // before
    call(vectorNode, [], null, null, null, null, [], null, null, ['s1']);

    // result — the gray outline goes through the thick-stroke-vertices path; the selected segment is
    // still drawn via drawVectorStroke, in the selected-state blue
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock).toHaveBeenCalledWith({}, {}, {}, expect.anything(), '#337ae1', 2, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw the hovered-vector-segment highlight in blue at half opacity when a segment is hovered by the Selection tool', () => {
    // before
    call(vectorNode, [], null, null, null, null, [], null, null, [], 's1');

    // result — the gray outline goes through the thick-stroke-vertices path; the hovered segment is
    // still drawn via drawVectorStroke, in blue with alpha 0.5
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock).toHaveBeenCalledWith({}, {}, {}, expect.anything(), '#337ae1', 2, 200, 150, IDENTITY_VIEWPORT, 0.5);
  });

  it('should draw nothing for a segment’s tangent handle when its parent vertex is not selected', () => {
    // before — no vertex/handle selected at all, so the s1 tangentStart handle stays hidden
    call(vectorNode, []);

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
  });

  it('should draw a segment’s tangent handles once the segment itself is selected, even with no vertex selected', () => {
    // before — s1 selected directly, no vertex/handle selection at all
    call(vectorNode, [], null, null, null, null, [], null, null, ['s1']);

    // result — both ends of s1 reveal their handle, exactly like a directly-touched-vertex selection would
    expect(drawLineMock).toHaveBeenCalledTimes(2);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 5, y1: 0, y2: 0 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 10, x2: 7.5, y1: 0, y2: 0 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw a tangent handle line and dot for a segment end once its parent vertex is selected', () => {
    // before — v1 is the real tangentStart handle's own parent vertex
    call(vectorNode, ['v1']);

    // result — the real tangentStart handle at v1, plus the tangentEnd-less end's own default preview handle
    // (both draw together once either endpoint is selected — Figma's one-hop neighbor reveal); the line uses
    // the same gray as the edit-mode connection outline
    expect(drawLineMock).toHaveBeenCalledTimes(2);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 5, y1: 0, y2: 0 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 10, x2: 7.5, y1: 0, y2: 0 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should batch a selected vertex into its own outer/inner selected-tier draws, separate from an unselected vertex’s plain-tier batch', () => {
    // before
    call(vectorNode, ['v1']);

    // result — v1 is selected, batched at the selected outer/inner sizes; v2 stays in the plain batch
    const plainCall = drawVectorVertexDotBatchMock.mock.calls.find((args) => args[5] === BASE_SIZE);
    const selectedOuterCall = drawVectorVertexDotBatchMock.mock.calls.find((args) => args[5] === SELECTED_OUTER_SIZE);
    const selectedInnerCall = drawVectorVertexDotBatchMock.mock.calls.find((args) => args[5] === SELECTED_INNER_SIZE);

    expect(plainCall?.[4]).toEqual([vectorNode.vertices.v2]);
    expect(selectedOuterCall?.[4]).toEqual([vectorNode.vertices.v1]);
    expect(selectedOuterCall?.[6]).toBe('#ffffff');
    expect(selectedInnerCall?.[4]).toEqual([vectorNode.vertices.v1]);
    expect(selectedInnerCall?.[6]).toBe('#337ae1');
  });

  it('should draw the hovered vertex immediately, larger than its unhovered (plain-batched) neighbor', () => {
    // before
    call(vectorNode, [], 'v1');

    // result — the hovered vertex draws immediately via drawEllipse; the other stays in the plain batch
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      expect.objectContaining({ fill: '#ffffff', width: HOVER_SIZE }),
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );

    const plainCall = drawVectorVertexDotBatchMock.mock.calls.find((args) => args[5] === BASE_SIZE);

    expect(plainCall?.[4]).toEqual([vectorNode.vertices.v2]);
  });

  it('should batch the Pen tool active vertex (the segment being extended from) into the selected-style outer/inner tiers', () => {
    // before
    call(vectorNode, [], null, null, 'v1');

    // result — same rendering as a real selection, even though v1 isn't in selectedVertexIds
    const selectedOuterCall = drawVectorVertexDotBatchMock.mock.calls.find((args) => args[5] === SELECTED_OUTER_SIZE);
    const selectedInnerCall = drawVectorVertexDotBatchMock.mock.calls.find((args) => args[5] === SELECTED_INNER_SIZE);

    expect(selectedOuterCall?.[4]).toEqual([vectorNode.vertices.v1]);
    expect(selectedOuterCall?.[6]).toBe('#ffffff');
    expect(selectedInnerCall?.[4]).toEqual([vectorNode.vertices.v1]);
    expect(selectedInnerCall?.[6]).toBe('#337ae1');
  });

  it('should draw a selected tangent handle as a solid-blue line and white-then-blue diamond pair, matching the selected-vertex style', () => {
    // before
    call(vectorNode, [], null, null, null, null, [{ end: 'start', segmentId: 's1' }]);

    // result — the same enlarge/recolor treatment selected vertices get, just diamond-shaped
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 5, y1: 0, y2: 0 }, '#337ae1', 1, 200, 150, IDENTITY_VIEWPORT);

    const outerDiamond = drawRectMock.mock.calls.find((args) => args[3].width === SELECTED_OUTER_SIZE)?.[3];
    const innerDiamond = drawRectMock.mock.calls.find((args) => args[3].fill === '#337ae1' && args[3].width === SELECTED_INNER_SIZE)?.[3];

    expect(outerDiamond).toMatchObject({ fill: '#ffffff' });
    expect(innerDiamond).toBeDefined();

    // result — selecting the handle must NOT make its own parent vertex (v1) render as selected too;
    // only the handle diamond gets the selected treatment, the vertex dot stays plain
    const selectedVertexDot = drawEllipseMock.mock.calls.find((args) => args[3].fill === '#337ae1');

    expect(selectedVertexDot).toBeUndefined();
  });

  it('should draw a snapped tangent handle line in the angle-snap orange, overriding the selected-blue it would otherwise get', () => {
    // before — the same handle is both selected (drag-armed) and currently snapped, matching a real
    // in-progress angle-snapped drag
    call(vectorNode, [], null, null, null, null, [{ end: 'start', segmentId: 's1' }], null, null, [], null, [], [], null, {
      end: 'start',
      segmentId: 's1',
    });

    // result
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 5, y1: 0, y2: 0 }, '#cd4422', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should deselect the tangent handle rendering once a vertex takes over the selection', () => {
    // before — selectedVertexIds non-empty, selectedHandles explicitly empty (mirrors the mutual-exclusivity a plain click enforces)
    call(vectorNode, ['v1'], null, null, null, null, []);

    // result — both handles fall back to their plain bordered-diamond look, not the selected two-layer pair;
    // v1's real handle and v2's own default preview handle both draw since v1 (either endpoint) is selected
    expect(drawRectMock).toHaveBeenCalledTimes(2);
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: BASE_SIZE, stroke: '#337ae1', width: BASE_SIZE, x: 2.5, y: -2.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      45,
    );
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: BASE_SIZE, stroke: '#337ae1', width: BASE_SIZE, x: 5, y: -2.5 },
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
    call(vectorNode, [], null, null, 'v1', null, [], { x: 30, y: 40 }, 'v1');

    // result — the existing v1 handle line (0,0 -> 5,0), v2's own default preview handle line (10,0 -> 7.5,0,
    // now also revealed since v1 counts as selected via penActiveVertexId), plus the drag-preview line
    // (0,0 -> 30,40)
    expect(drawLineMock).toHaveBeenCalledTimes(3);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 30, y1: 0, y2: 40 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw the Pen drag-preview line in the angle-snap orange when the live drag is snapped', () => {
    // before — same setup as the plain drag-preview case above, but flagged as snapped
    call(vectorNode, [], null, null, 'v1', null, [], { x: 30, y: 0 }, 'v1', [], null, [], [], null, null, true);

    // result
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 30, y1: 0, y2: 0 }, '#cd4422', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should also reveal handles via the drag’s origin vertex when penActiveVertexId is null — e.g. closing a loop by dragging (penActiveVertexId is cleared before the drag continues)', () => {
    // before — penActiveVertexId null, but dragOriginVertexId is v1, mirroring closeLoopOntoVertex.ts's
    // sequence (setPenActiveVertexId(null) dispatched, then dragOriginRef armed on the same vertex)
    call(vectorNode, [], null, null, null, null, [], { x: 30, y: 40 }, 'v1');

    // result — same reveal as the real active-vertex case above: v1's own handle, v2's one-hop preview
    // handle, plus the live drag-preview line anchored on v1 (not silently hidden just because
    // penActiveVertexId itself reads null at this point)
    expect(drawLineMock).toHaveBeenCalledTimes(3);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 30, y1: 0, y2: 40 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw vertex dots at their rotated world position for a node with a persisted, not-yet-baked rotation', () => {
    // mock — v1(0,0)/v2(10,0), 90deg around the bounds-center (5, 0): v1 -> (5, -5), v2 -> (5, 5); dots
    // must track the same rotated positions the fill/stroke render at (drawVectorNode.ts), not the raw
    // stored coordinates, since baking is deferred until an actual edit starts
    const rotatedVectorNode: TVectorNode = { ...vectorNode, rotation: 90, segments: {} };

    // before
    call(rotatedVectorNode, ['v1']);

    // result — v1 (selected) and v2 (plain) both flow into their respective batches, at their baked (rotated)
    // world positions, not the raw stored coordinates
    const selectedInnerCall = drawVectorVertexDotBatchMock.mock.calls.find((args) => args[5] === SELECTED_INNER_SIZE);
    const plainCall = drawVectorVertexDotBatchMock.mock.calls.find((args) => args[5] === BASE_SIZE);
    const [selectedCenter] = selectedInnerCall?.[4] as { x: number; y: number }[];
    const [plainCenter] = plainCall?.[4] as { x: number; y: number }[];

    expect(drawEllipseMock).not.toHaveBeenCalled();
    expect(selectedCenter.x).toBeCloseTo(5);
    expect(selectedCenter.y).toBeCloseTo(-5);
    expect(plainCenter.x).toBeCloseTo(5);
    expect(plainCenter.y).toBeCloseTo(5);
  });

  it('should reveal a curved segment’s handles reached through a straight (tangent-less) connector — one-hop-by-vertex, not by-segment', () => {
    // mock — A(selected) --straight(s1, no tangent)-- B --curved(s2, real tangentStart at B)-- C; B has no
    // tangent of its own on s1, but must still count as a revealed neighbor of A so s2's handles (which
    // don't touch A directly) become visible too, matching Figma
    const chainNode: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
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

    // before — only A is selected
    call(chainNode, ['A']);

    // result — s1 has no tangent so it draws nothing; B is one hop from A via straight s1, so s2's real
    // tangentStart handle at B draws (10,0)+(5,0)=(15,0) — but s2 does not directly touch A, so C's own end
    // stays hidden (one-hop-by-vertex reveals only B's own handle, not the far end of B's other segment)
    expect(drawLineMock).toHaveBeenCalledTimes(1);
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 10, x2: 15, y1: 0, y2: 0 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
  });
});
