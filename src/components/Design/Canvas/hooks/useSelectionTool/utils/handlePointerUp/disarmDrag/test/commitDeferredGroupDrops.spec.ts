// store
import { setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { LayoutMode } from 'types/design/enums';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { addChildren, addFrame, addRoot, makeManualGrid, readAnchor, readChildIds, resetPage } from './multiParentFixtures';
import { commitDeferredGroupDrops } from '../commitDeferredGroupDrops';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const dragState = (overrides: Partial<TDragState>): TDragState =>
  ({
    candidateShapes: [],
    ctrlMarqueeFallback: null,
    dispatchThrottle: { frameId: null, run: null },
    hasMoved: true,
    nodeOrigins: {},
    pendingClickAction: null,
    pointerStart: { x: 0, y: 0 },
    ...overrides,
  }) as TDragState;

describe('commitDeferredGroupDrops', () => {
  beforeEach(resetPage);

  it('should do nothing when the drag never recorded a delta', () => {
    // mock
    const follower = addFrame(LayoutMode.vertical, 0, 0);
    const other = addFrame(LayoutMode.vertical, 400, 0);
    const [a, b] = addChildren(follower, 2);
    const [grabbed] = addChildren(other, 1);

    store.dispatch(setSelection([a, grabbed]));

    // action
    commitDeferredGroupDrops(store.dispatch, dragState({ grabbedNodeId: grabbed }), createCanvasRefs(), { steps: 1, x: 0, y: 1 });

    // result
    expect(readChildIds(follower)).toEqual([a, b]);
  });

  it('should do nothing when the grabbed group abandoned reorder mode', () => {
    // mock
    const follower = addFrame(LayoutMode.vertical, 0, 0);
    const other = addFrame(LayoutMode.vertical, 400, 0);
    const [a, b] = addChildren(follower, 2);
    const [grabbed] = addChildren(other, 1);

    store.dispatch(setSelection([a, grabbed]));

    // action
    commitDeferredGroupDrops(
      store.dispatch,
      dragState({ delta: { x: 0, y: 30 }, grabbedNodeId: grabbed, reorderModeAbandoned: true }),
      createCanvasRefs(),
      {
        steps: 1,
        x: 0,
        y: 1,
      },
    );

    // result
    expect(readChildIds(follower)).toEqual([a, b]);
  });

  it('should move a deferred group by the grabbed group’s slot delta and leave the grabbed group alone', () => {
    // mock
    const follower = addFrame(LayoutMode.vertical, 0, 0);
    const other = addFrame(LayoutMode.vertical, 400, 0);
    const [a, b, c] = addChildren(follower, 3);
    const [grabbed, second] = addChildren(other, 2);

    store.dispatch(setSelection([a, grabbed]));

    // action
    commitDeferredGroupDrops(store.dispatch, dragState({ delta: { x: 0, y: 500 }, grabbedNodeId: grabbed }), createCanvasRefs(), {
      steps: 1,
      x: 0,
      y: 1,
    });

    // result
    expect(readChildIds(follower)).toEqual([b, a, c]);
    expect(readChildIds(other)).toEqual([grabbed, second]);
  });

  it('should fall back to the pixel delta for a list follower when the grabbed group is not in a layout', () => {
    // mock — 20px children stacked at y 0/20/40; a 25px delta moves the group centre across only the next sibling
    const follower = addFrame(LayoutMode.vertical, 0, 0);
    const [a, b, c] = addChildren(follower, 3);

    const grabbed = addRoot(900, 900);

    store.dispatch(setSelection([a, grabbed]));

    // action
    commitDeferredGroupDrops(store.dispatch, dragState({ delta: { x: 0, y: 25 }, grabbedNodeId: grabbed }), createCanvasRefs(), null);

    // result
    expect(readChildIds(follower)).toEqual([b, a, c]);
  });

  it('should fall back to the pixel delta for a manual grid follower, landing in the hovered cell', () => {
    // mock — 3 columns of 100px cells; a 120px delta from the first cell lands in the second column
    const follower = addFrame(LayoutMode.grid, 0, 0);
    const [a] = addChildren(follower, 1);

    makeManualGrid(follower, [{ childId: a, column: 0, row: 0 }]);
    const grabbed = addRoot(900, 900);

    store.dispatch(setSelection([a, grabbed]));

    // action
    commitDeferredGroupDrops(store.dispatch, dragState({ delta: { x: 120, y: 0 }, grabbedNodeId: grabbed }), createCanvasRefs(), null);

    // result
    expect(readAnchor(a)).toEqual({ column: 1, row: 0 });
  });

  it('should clear every drop-target ref it armed for a deferred group', () => {
    // mock
    const follower = addFrame(LayoutMode.vertical, 0, 0);
    const [a] = addChildren(follower, 2);
    const refs = createCanvasRefs();

    const grabbed = addRoot(900, 900);

    store.dispatch(setSelection([a, grabbed]));

    // action
    commitDeferredGroupDrops(store.dispatch, dragState({ delta: { x: 0, y: 25 }, grabbedNodeId: grabbed }), refs, null);

    // result
    expect(refs.transform.dropTargetFrameIdRef.current).toBeNull();
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
    expect(refs.transform.autoLayoutDropTargetRef.current).toBeNull();
    expect(refs.transform.gridDropTargetRef.current).toBeNull();
  });

  it('should do nothing when no node is grabbed, since the whole selection is then the grabbed group', () => {
    // mock
    const follower = addFrame(LayoutMode.vertical, 0, 0);
    const [a, b] = addChildren(follower, 2);

    store.dispatch(setSelection([a]));

    // action
    commitDeferredGroupDrops(store.dispatch, dragState({ delta: { x: 0, y: 25 } }), createCanvasRefs(), { steps: 1, x: 0, y: 1 });

    // result
    expect(readChildIds(follower)).toEqual([a, b]);
  });
});
