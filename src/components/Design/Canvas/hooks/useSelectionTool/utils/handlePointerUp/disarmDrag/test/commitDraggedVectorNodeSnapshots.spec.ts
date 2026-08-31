// store
import { updateNode } from 'store/design/slice';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { commitDraggedVectorNodeSnapshots } from '../commitDraggedVectorNodeSnapshots';

const buildCanvasRefs = (): TCanvasRefs =>
  ({ vectorSnapshots: { draggedVectorNodeSnapshotsRef: { current: null } } }) as unknown as TCanvasRefs;

const buildDragState = (nodeOrigins: TDragState['nodeOrigins'], hasMoved = true): TDragState =>
  ({
    dispatchThrottle: { frameId: null, run: null },
    hasMoved,
    nodeOrigins,
    pendingClickAction: null,
    pointerStart: { x: 0, y: 0 },
  }) as TDragState;

describe('commitDraggedVectorNodeSnapshots', () => {
  it('should do nothing when there is no snapshot map at all', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = buildCanvasRefs();
    const dragState = buildDragState({});

    // before
    commitDraggedVectorNodeSnapshots(dispatch, dragState, canvasRefs);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch one final geometry update per snapshotted node, using its captured origin and the snapshot’s live delta, then clear the snapshot map', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = buildCanvasRefs();
    const dragState = buildDragState({ 'node-1': { x: 100, y: 100 } });

    canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current = new Map([
      ['node-1', { deltaX: 5, deltaY: -3, facesByColor: [], strokeColor: '#00ff00', strokeVertices: [] }],
    ]);

    // before
    commitDraggedVectorNodeSnapshots(dispatch, dragState, canvasRefs);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { x: 105, y: 97 }, id: 'node-1' }));
    expect(canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current).toBeNull();
  });

  it('should not dispatch (and not round any vertex) for a plain click with no real movement, just clear the snapshot map', () => {
    // mock — a click that never moved the pointer must not touch geometry at all, since
    // getGeometryDeltaChanges/translateVectorVertices round every vertex to the nearest pixel;
    // running that on a zero-delta click would silently destroy sub-pixel curve precision
    // (e.g. real font-glyph bezier data from Flatten) even though nothing was ever dragged
    const dispatch = vi.fn();
    const canvasRefs = buildCanvasRefs();
    const dragState = buildDragState({ 'node-1': { x: 100.25, y: 100.75 } }, false);

    canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current = new Map([
      ['node-1', { deltaX: 0, deltaY: 0, facesByColor: [], strokeColor: '#00ff00', strokeVertices: [] }],
    ]);

    // before
    commitDraggedVectorNodeSnapshots(dispatch, dragState, canvasRefs);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current).toBeNull();
  });

  it('should skip a snapshotted node whose origin was never captured, without dispatching or throwing', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = buildCanvasRefs();
    const dragState = buildDragState({});

    canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current = new Map([
      ['node-1', { deltaX: 5, deltaY: -3, facesByColor: [], strokeColor: '#00ff00', strokeVertices: [] }],
    ]);

    // before
    commitDraggedVectorNodeSnapshots(dispatch, dragState, canvasRefs);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current).toBeNull();
  });
});
