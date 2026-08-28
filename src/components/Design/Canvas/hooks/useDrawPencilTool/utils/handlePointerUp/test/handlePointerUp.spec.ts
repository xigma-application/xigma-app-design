import { RefObject } from 'react';

// store
import { selectActivePage } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { TAxisLock } from 'components/Design/Canvas/utils/getAxisLockedPoint';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { handlePointerDown } from '../../handlePointerDown/handlePointerDown';
import { handlePointerUp } from '../handlePointerUp';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();
  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (options: Partial<PointerEventInit> = {}): PointerEvent => new PointerEvent('pointerup', { pointerId: 1, ...options });
const downEvent = (options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1, ...options });

const createPointsRef = (value: TPoint[] | null): RefObject<TPoint[] | null> => ({ current: value });
const createAxisLockRef = (value: TAxisLock | null = null): RefObject<TAxisLock | null> => ({ current: value });
const createShiftAnchorRef = (value: TPoint | null = null): RefObject<TPoint | null> => ({ current: value });

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when there is no stroke in progress', () => {
    // mock
    const canvas = createCanvas();
    const rootOrderBefore = store.getState().design.pages[store.getState().design.activePageId].rootOrder.length;

    // before
    handlePointerUp(
      canvas,
      pointerEvent(),
      store.dispatch,
      store,
      createCanvasRefs(),
      createPointsRef(null),
      createPointsRef(null),
      createAxisLockRef(),
      createShiftAnchorRef(),
      createPointsRef(null),
    );

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].rootOrder).toHaveLength(rootOrderBefore);
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should finalize the pending tail into the committed points before building the node', () => {
    // mock — the tail alone (10px) is under MIN_SHAPE_SIZE only if never merged with committed, but
    // combined with the committed prefix it clears the gate, proving the tail gets folded in first
    const canvas = createCanvas();
    const committedPointsRef = createPointsRef([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]);
    const tailPointsRef = createPointsRef([
      { x: 5, y: 0 },
      { x: 15, y: 0 },
    ]);

    // before
    handlePointerUp(
      canvas,
      pointerEvent(),
      store.dispatch,
      store,
      createCanvasRefs(),
      committedPointsRef,
      tailPointsRef,
      createAxisLockRef(),
      createShiftAnchorRef(),
      createPointsRef(null),
    );

    // result
    const { nodes, rootOrder } = selectActivePage(store.getState());
    const node = nodes[rootOrder[rootOrder.length - 1]] as TVectorNode;

    expect(Object.keys(node.vertices)).toHaveLength(3);
  });

  it('should coalesce the node creation and its selection into a single undoable gesture that also restores the pointerdown-time vector selection', () => {
    // mock — a full down-then-up cycle: beginHistoryGesture (dispatched by handlePointerDown) only
    // stages its snapshot, which the FIRST undoable action inside the gesture (addNode, from this
    // handlePointerUp) actually commits — so this must be exercised end to end, not via handlePointerUp
    // alone, to prove the refs snapshot captured at pointerdown time is what undo ultimately restores
    const canvas = createCanvas();
    const refs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['stale-vertex'] } } });

    handlePointerDown(
      canvas,
      downEvent(),
      store.dispatch,
      store,
      refs,
      createPointsRef(null),
      createPointsRef(null),
      createAxisLockRef(),
      createShiftAnchorRef(),
      createPointsRef(null),
    );

    const committedPointsRef = createPointsRef([{ x: 0, y: 0 }]);
    const tailPointsRef = createPointsRef([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);

    // before
    handlePointerUp(
      canvas,
      pointerEvent(),
      store.dispatch,
      store,
      refs,
      committedPointsRef,
      tailPointsRef,
      createAxisLockRef(),
      createShiftAnchorRef(),
      createPointsRef(null),
    );

    const rootOrderAfterCommit = store.getState().design.pages[store.getState().design.activePageId].rootOrder.length;

    // action
    const restored = store.dispatch(undo());

    // result — one undo reverts both the add and the selection change together, and returns the
    // vector-selection snapshot from the moment the gesture began, not an empty one
    expect(store.getState().design.pages[store.getState().design.activePageId].rootOrder).toHaveLength(rootOrderAfterCommit - 1);
    expect(restored).toEqual({ selectedVectorHandles: [], selectedVectorSegmentIds: [], selectedVectorVertexIds: ['stale-vertex'] });
  });

  it('should delegate to foldPendingAxisLock, so a stroke released while still Shift-locked still commits a node', () => {
    // mock — regression check for the orchestrator's wiring: foldPendingAxisLock itself is unit
    // tested separately, this just proves handlePointerUp actually calls it before finalizing
    const canvas = createCanvas();
    const tailPointsRef = createPointsRef([{ x: 0, y: 0 }]);

    // before — pointerup lands at (50, 30), well past MIN_SHAPE_SIZE once the locked point is folded in
    handlePointerUp(
      canvas,
      pointerEvent({ clientX: 50, clientY: 30 }),
      store.dispatch,
      store,
      createCanvasRefs(),
      createPointsRef([{ x: 0, y: 0 }]),
      tailPointsRef,
      createAxisLockRef('x'),
      createShiftAnchorRef({ x: 0, y: 0 }),
      createPointsRef(null),
    );

    // result
    const { nodes, rootOrder } = selectActivePage(store.getState());
    const node = nodes[rootOrder[rootOrder.length - 1]] as TVectorNode;

    expect(Object.keys(node.vertices)).toHaveLength(2);
  });

  it('should clear every ref and release pointer capture regardless of whether a node was created', () => {
    // mock — anchor equals the pointerup position, so the pending axis-lock push below appends a
    // zero-length duplicate, keeping the path under MIN_SHAPE_SIZE and the node uncommitted
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const committedPointsRef = createPointsRef([{ x: 0, y: 0 }]);
    const tailPointsRef = createPointsRef([{ x: 0, y: 0 }]);
    const axisLockRef = createAxisLockRef('x');
    const shiftAnchorRef = createShiftAnchorRef({ x: 0, y: 0 });
    const rawPointsRef = createPointsRef([{ x: 0, y: 0 }]);

    refs.pencil.pencilPreviewPointsRef.current = [{ x: 0, y: 0 }];
    refs.pencil.pencilRawPreviewPointsRef.current = [{ x: 0, y: 0 }];
    refs.pencil.pencilShowRawPreviewRef.current = true;

    // before — too short to commit a node, but cleanup must still happen
    handlePointerUp(
      canvas,
      pointerEvent(),
      store.dispatch,
      store,
      refs,
      committedPointsRef,
      tailPointsRef,
      axisLockRef,
      shiftAnchorRef,
      rawPointsRef,
    );

    // result
    expect(committedPointsRef.current).toBeNull();
    expect(tailPointsRef.current).toBeNull();
    expect(axisLockRef.current).toBeNull();
    expect(shiftAnchorRef.current).toBeNull();
    expect(rawPointsRef.current).toBeNull();
    expect(refs.pencil.pencilPreviewPointsRef.current).toBeNull();
    expect(refs.pencil.pencilRawPreviewPointsRef.current).toBeNull();
    expect(refs.pencil.pencilShowRawPreviewRef.current).toBe(false);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
  });
});
