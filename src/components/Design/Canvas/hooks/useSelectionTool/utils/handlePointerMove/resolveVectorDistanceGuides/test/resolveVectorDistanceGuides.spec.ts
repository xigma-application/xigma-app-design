// store
import { addNode, deleteNode, setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getDistanceGuides } from '../../../../../../utils/getDistanceGuides/getDistanceGuides';
import { getPointToPointGuides } from '../../../../../../utils/getVectorDistanceGuides/getPointToPointGuides';
import { resolveVectorDistanceGuides } from '../resolveVectorDistanceGuides';

const SENTINEL = { sentinel: true } as unknown as TCanvasRefs['transform']['distanceGuidesRef']['current'];

type TRefOverrides = {
  hoveredFace?: { faceKey: string; nodeId: string } | null;
  hoveredSegmentId?: string | null;
  hoveredVertexId?: string | null;
  nullSelectionRefs?: boolean;
  selectedVertexIds?: string[];
};

const makeRefs = (over: TRefOverrides = {}): TCanvasRefs =>
  ({
    hover: {
      hoveredVectorFaceSelectRef: { current: over.hoveredFace ?? null },
      hoveredVectorSegmentIdRef: { current: over.hoveredSegmentId ?? null },
      hoveredVectorVertexIdRef: { current: over.hoveredVertexId ?? null },
    },
    transform: { distanceGuidesRef: { current: SENTINEL } },
    vectorEdit: {
      selectedVectorSegmentIdsRef: { current: over.nullSelectionRefs ? null : [] },
      selectedVectorVertexIdsRef: { current: over.nullSelectionRefs ? null : (over.selectedVertexIds ?? []) },
    },
  }) as unknown as TCanvasRefs;

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

// identity viewport + a canvas pinned at (0,0) means clientX/clientY land as-is in world space
const altMove = (x = 0, y = 0, altKey = true, buttons = 0): PointerEvent =>
  new PointerEvent('pointermove', { altKey, buttons, clientX: x, clientY: y });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
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
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 100, y: 100 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

// a closed triangle in a separate node, elsewhere on the canvas, so deriveVectorFaces has a real
// face to find — the "measure a whole shape against another" scenario
const addClosedTriangleFaceNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        fs1: { endId: 'fv2', id: 'fs1', startId: 'fv1', tangentEnd: null, tangentStart: null },
        fs2: { endId: 'fv3', id: 'fs2', startId: 'fv2', tangentEnd: null, tangentStart: null },
        fs3: { endId: 'fv1', id: 'fs3', startId: 'fv3', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      // apex-up, so the triangle's own bounding-box top-left corner (500,50) is empty space —
      // nowhere near the actual outline — proving a measurement lands on the real shape, not a
      // possibly-empty bbox corner
      vertices: { fv1: { id: 'fv1', x: 500, y: 100 }, fv2: { id: 'fv2', x: 700, y: 100 }, fv3: { id: 'fv3', x: 600, y: 50 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('resolveVectorDistanceGuides', () => {
  const canvas = createCanvas();
  let vectorNodeId: string;

  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    vectorNodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeIds([vectorNodeId]));
    store.dispatch(setActiveTool(ToolName.move));
  });

  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should leave the ref untouched when not in Vector Edit Mode', () => {
    store.dispatch(setVectorEditingNodeIds([]));

    const refs = makeRefs({ hoveredVertexId: 'v3', selectedVertexIds: ['v1'] });

    resolveVectorDistanceGuides(canvas, altMove(), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBe(SENTINEL);
  });

  it('should populate the ref and set the measure cursor for a valid Alt-hover', () => {
    const refs = makeRefs({ hoveredVertexId: 'v3', selectedVertexIds: ['v1'] });
    const setClassName = vi.fn();

    resolveVectorDistanceGuides(canvas, altMove(), refs, setClassName);

    expect(refs.transform.distanceGuidesRef.current?.lines).toEqual([
      { dashed: false, x1: 0, x2: 100, y1: 0, y2: 0 },
      { dashed: true, x1: 100, x2: 100, y1: 0, y2: 100 },
      { dashed: false, x1: 0, x2: 0, y1: 0, y2: 100 },
      { dashed: true, x1: 0, x2: 100, y1: 100, y2: 100 },
    ]);
    expect(setClassName).toHaveBeenCalledWith('distance-measure');
  });

  it('should snap to the point on a hovered segment nearest the cursor, riding along it as the cursor moves', () => {
    const refs = makeRefs({ hoveredSegmentId: 's2', selectedVertexIds: ['v1'] });

    // s2 runs from v2 (100,0) to v3 (100,100); the cursor sits partway down it
    resolveVectorDistanceGuides(canvas, altMove(150, 30), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toEqual({
      ...getPointToPointGuides({ x: 0, y: 0 }, { x: 100, y: 30 }),
      targetPoint: { x: 100, y: 30 },
    });

    // moving the cursor further down the same segment tracks a different point — no new vertex,
    // just the live measurement following the cursor like riding along a rail
    resolveVectorDistanceGuides(canvas, altMove(150, 80), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toEqual({
      ...getPointToPointGuides({ x: 0, y: 0 }, { x: 100, y: 80 }),
      targetPoint: { x: 100, y: 80 },
    });
  });

  it('should ride along the anchor vertex’s own connected segment too, away from the vertex itself', () => {
    const refs = makeRefs({ hoveredSegmentId: 's1', selectedVertexIds: ['v1'] });

    // s1 runs from the selected v1 (0,0) to v2 (100,0) — its own edge, not a foreign one
    resolveVectorDistanceGuides(canvas, altMove(50, 10), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toEqual({
      ...getPointToPointGuides({ x: 0, y: 0 }, { x: 50, y: 0 }),
      targetPoint: { x: 50, y: 0 },
    });
  });

  it('should clear the ref when Alt is not held', () => {
    const refs = makeRefs({ hoveredVertexId: 'v3', selectedVertexIds: ['v1'] });

    resolveVectorDistanceGuides(canvas, altMove(0, 0, false), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should clear the ref while a drag is in progress', () => {
    const refs = makeRefs({ hoveredVertexId: 'v3', selectedVertexIds: ['v1'] });

    resolveVectorDistanceGuides(canvas, altMove(0, 0, true, 1), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should clear the ref for a Vector Edit sub-tool other than Move', () => {
    store.dispatch(setActiveTool(ToolName.bend));

    const refs = makeRefs({ hoveredVertexId: 'v3', selectedVertexIds: ['v1'] });

    resolveVectorDistanceGuides(canvas, altMove(), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should clear the ref when there is no hovered target', () => {
    const refs = makeRefs({ selectedVertexIds: ['v1'] });

    resolveVectorDistanceGuides(canvas, altMove(), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should treat unset selection refs as empty and clear the ref', () => {
    const refs = makeRefs({ hoveredVertexId: 'v3', nullSelectionRefs: true });

    resolveVectorDistanceGuides(canvas, altMove(), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should anchor on the bounding box of two selected vertices and measure against a third, hovered vertex', () => {
    const refs = makeRefs({ hoveredVertexId: 'v3', selectedVertexIds: ['v1', 'v2'] });

    resolveVectorDistanceGuides(canvas, altMove(), refs, vi.fn());

    // v1 (0,0) + v2 (100,0) box vs. v3 (100,100) — reuses Stage 1's rect-vs-rect distance guides
    const { labels, lines } = getDistanceGuides({ height: 0, width: 100, x: 0, y: 0 }, { height: 0, width: 0, x: 100, y: 100 });

    expect(refs.transform.distanceGuidesRef.current).toEqual({ labels, lines, targetPoint: { id: 'v3', x: 100, y: 100 } });
  });

  it('should clear the ref when the only hovered vertex is itself part of the box selection', () => {
    const refs = makeRefs({ hoveredVertexId: 'v2', selectedVertexIds: ['v1', 'v2'] });

    resolveVectorDistanceGuides(canvas, altMove(), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should measure a whole hovered face against a box anchor — shape-to-shape, landing on the face’s real outline', () => {
    const faceNodeId = addClosedTriangleFaceNode();

    store.dispatch(setVectorEditingNodeIds([vectorNodeId, faceNodeId]));

    const faceNode = store.getState().design.pages[store.getState().design.activePageId].nodes[faceNodeId];
    const [face] = deriveVectorFaces(faceNode as TVectorNode);
    const refs = makeRefs({ hoveredFace: { faceKey: face.key, nodeId: faceNodeId }, selectedVertexIds: ['v1', 'v2'] });

    resolveVectorDistanceGuides(canvas, altMove(), refs, vi.fn());

    // v1 (0,0) + v2 (100,0) box (center 50,0) vs. the triangle's nearest own vertex (500,100) — not
    // its bounding box's top-left corner (500,50), which sits in empty space above the apex
    const { labels, lines } = getDistanceGuides({ height: 0, width: 100, x: 0, y: 0 }, { height: 0, width: 0, x: 500, y: 100 });

    expect(refs.transform.distanceGuidesRef.current).toEqual({ labels, lines, targetPoint: { x: 500, y: 100 } });
  });
});
