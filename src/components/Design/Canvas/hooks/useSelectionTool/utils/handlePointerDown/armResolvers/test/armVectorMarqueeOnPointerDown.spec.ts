// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// utils
import { armVectorMarqueeOnPointerDown } from '../armVectorMarqueeOnPointerDown';

const createContext = (
  hit: unknown,
  shiftKey: boolean,
): Record<string, unknown> & {
  canvasRefs: { vectorEdit: Record<string, { current: unknown }> };
  selectionRefs: Record<string, { current: unknown }>;
} => ({
  canvas: { setPointerCapture: vi.fn() },
  canvasRefs: {
    vectorEdit: {
      preVectorMarqueeSegmentIdsRef: { current: null },
      preVectorMarqueeVertexIdsRef: { current: null },
      selectedVectorHandlesRef: { current: ['h'] },
      selectedVectorSegmentIdsRef: { current: ['s'] },
      selectedVectorVertexIdsRef: { current: ['a'] },
    },
  },
  event: { pointerId: 2, shiftKey },
  hit,
  point: { x: 1, y: 2 },
  selectionRefs: { vectorMarqueeModeRef: { current: 'old' }, vectorMarqueeStartRef: { current: null } },
});

describe('armVectorMarqueeOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should remember the selection, clear it and start a vector marquee from empty space', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['v']));
    const ctx = createContext(null, false);

    // before
    const result = armVectorMarqueeOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(ctx.canvasRefs.vectorEdit.preVectorMarqueeVertexIdsRef.current).toEqual(['a']);
    expect(ctx.canvasRefs.vectorEdit.preVectorMarqueeSegmentIdsRef.current).toEqual(['s']);
    expect(ctx.canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(ctx.canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
    expect(ctx.selectionRefs.vectorMarqueeModeRef.current).toBeNull();
    expect(ctx.selectionRefs.vectorMarqueeStartRef.current).toEqual({ x: 1, y: 2 });
  });

  it('should leave the pointer alone over a layer, with Shift held or nothing being edited', () => {
    // result
    expect(armVectorMarqueeOnPointerDown(createContext(null, false) as never)).toBeUndefined();
    store.dispatch(setVectorEditingNodeIds(['v']));
    expect(armVectorMarqueeOnPointerDown(createContext({ id: 'x' }, false) as never)).toBeUndefined();
    expect(armVectorMarqueeOnPointerDown(createContext(null, true) as never)).toBeUndefined();
  });
});
