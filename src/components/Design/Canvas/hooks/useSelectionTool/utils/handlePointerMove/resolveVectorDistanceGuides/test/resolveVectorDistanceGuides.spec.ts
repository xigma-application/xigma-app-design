// store
import { addNode, deleteNode, setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getDistanceGuides } from '../../../../../../utils/getDistanceGuides/getDistanceGuides';
import { resolveVectorDistanceGuides } from '../resolveVectorDistanceGuides';

const SENTINEL = { sentinel: true } as unknown as TCanvasRefs['transform']['distanceGuidesRef']['current'];

type TRefOverrides = {
  hoveredSegmentId?: string | null;
  hoveredVertexId?: string | null;
  nullSelectionRefs?: boolean;
  selectedVertexIds?: string[];
};

const makeRefs = (over: TRefOverrides = {}): TCanvasRefs =>
  ({
    hover: {
      hoveredVectorSegmentIdRef: { current: over.hoveredSegmentId ?? null },
      hoveredVectorVertexIdRef: { current: over.hoveredVertexId ?? null },
    },
    transform: { distanceGuidesRef: { current: SENTINEL } },
    vectorEdit: {
      selectedVectorSegmentIdsRef: { current: over.nullSelectionRefs ? null : [] },
      selectedVectorVertexIdsRef: { current: over.nullSelectionRefs ? null : (over.selectedVertexIds ?? []) },
    },
  }) as unknown as TCanvasRefs;

const altMove = (altKey = true, buttons = 0): PointerEvent => new PointerEvent('pointermove', { altKey, buttons });

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

describe('resolveVectorDistanceGuides', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setVectorEditingNodeIds([addVectorNode()]));
    store.dispatch(setActiveTool(ToolName.move));
  });

  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should leave the ref untouched when not in Vector Edit Mode', () => {
    store.dispatch(setVectorEditingNodeIds([]));

    const refs = makeRefs({ hoveredVertexId: 'v3', selectedVertexIds: ['v1'] });

    resolveVectorDistanceGuides(altMove(), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBe(SENTINEL);
  });

  it('should populate the ref and set the measure cursor for a valid Alt-hover', () => {
    const refs = makeRefs({ hoveredVertexId: 'v3', selectedVertexIds: ['v1'] });
    const setClassName = vi.fn();

    resolveVectorDistanceGuides(altMove(), refs, setClassName);

    expect(refs.transform.distanceGuidesRef.current?.lines).toEqual([
      { dashed: false, x1: 0, x2: 100, y1: 0, y2: 0 },
      { dashed: true, x1: 100, x2: 100, y1: 0, y2: 100 },
      { dashed: false, x1: 0, x2: 0, y1: 0, y2: 100 },
      { dashed: true, x1: 0, x2: 100, y1: 100, y2: 100 },
    ]);
    expect(setClassName).toHaveBeenCalledWith('distance-measure');
  });

  it('should route a hovered segment through to a point-to-segment measurement', () => {
    const refs = makeRefs({ hoveredSegmentId: 's2', selectedVertexIds: ['v1'] });

    resolveVectorDistanceGuides(altMove(), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current?.lines).toEqual([{ dashed: false, x1: 0, x2: 100, y1: 0, y2: 0 }]);
  });

  it('should clear the ref when Alt is not held', () => {
    const refs = makeRefs({ hoveredVertexId: 'v3', selectedVertexIds: ['v1'] });

    resolveVectorDistanceGuides(altMove(false), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should clear the ref while a drag is in progress', () => {
    const refs = makeRefs({ hoveredVertexId: 'v3', selectedVertexIds: ['v1'] });

    resolveVectorDistanceGuides(altMove(true, 1), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should clear the ref for a Vector Edit sub-tool other than Move', () => {
    store.dispatch(setActiveTool(ToolName.bend));

    const refs = makeRefs({ hoveredVertexId: 'v3', selectedVertexIds: ['v1'] });

    resolveVectorDistanceGuides(altMove(), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should clear the ref when there is no hovered target', () => {
    const refs = makeRefs({ selectedVertexIds: ['v1'] });

    resolveVectorDistanceGuides(altMove(), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should treat unset selection refs as empty and clear the ref', () => {
    const refs = makeRefs({ hoveredVertexId: 'v3', nullSelectionRefs: true });

    resolveVectorDistanceGuides(altMove(), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should anchor on the bounding box of two selected vertices and measure against a third, hovered vertex', () => {
    const refs = makeRefs({ hoveredVertexId: 'v3', selectedVertexIds: ['v1', 'v2'] });

    resolveVectorDistanceGuides(altMove(), refs, vi.fn());

    // v1 (0,0) + v2 (100,0) box vs. v3 (100,100) — reuses Stage 1's rect-vs-rect distance guides
    const { labels, lines } = getDistanceGuides({ height: 0, width: 100, x: 0, y: 0 }, { height: 0, width: 0, x: 100, y: 100 });

    expect(refs.transform.distanceGuidesRef.current).toEqual({ labels, lines });
  });

  it('should clear the ref when the only hovered vertex is itself part of the box selection', () => {
    const refs = makeRefs({ hoveredVertexId: 'v2', selectedVertexIds: ['v1', 'v2'] });

    resolveVectorDistanceGuides(altMove(), refs, vi.fn());

    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });
});
