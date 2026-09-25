// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { commitResizedVectorNodeSnapshots } from '../commitResizedVectorNodeSnapshots';

const resizeVectorNodeMock = vi.fn();
const solverMock = vi.fn(() => 'solver');

vi.mock('../../handlePointerMove/continueResizeDrag/resizeNode/resizeVectorNode/resizeVectorNode', () => ({
  resizeVectorNode: (...args: unknown[]): unknown => resizeVectorNodeMock(...args),
}));
vi.mock('../../handlePointerMove/continueResizeDrag/getRotatedAnchorSolver', () => ({
  getRotatedAnchorSolver: (...args: unknown[]): unknown => solverMock(...(args as [])),
}));

const snapshot = { anchorX: 1, anchorY: 2, scaleX: 3, scaleY: 4 };
const refs = (snapshots: Map<string, unknown> | null): TCanvasRefs =>
  ({ vectorSnapshots: { resizedVectorNodeSnapshotsRef: { current: snapshots } } }) as unknown as TCanvasRefs;
const dragState = (nodeOrigins: Record<string, unknown>): TResizeDragState =>
  ({ bounds: 'bounds', handle: 'se', nodeOrigins }) as unknown as TResizeDragState;

describe('commitResizedVectorNodeSnapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should commit a single rotated vector resize with its rotated anchor and clear the snapshots', () => {
    // mock
    const dispatch = vi.fn();
    const origin = { rotation: 30, vertices: {} };
    const canvasRefs = refs(new Map([['v', snapshot]]));

    // before
    commitResizedVectorNodeSnapshots(dispatch, dragState({ v: origin }), canvasRefs);

    // result
    expect(solverMock).toHaveBeenCalledWith('bounds', 'se', 30, 3, 4);
    expect(resizeVectorNodeMock).toHaveBeenCalledWith('v', origin, dispatch, { x: 1, y: 2 }, 3, 4, 'solver');
    expect(canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current).toBeNull();
  });

  it('should commit unrotated and multi-node resizes without a rotated anchor and skip non-vector origins', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = refs(
      new Map([
        ['a', snapshot],
        ['b', snapshot],
        ['c', snapshot],
      ]),
    );

    // before
    commitResizedVectorNodeSnapshots(
      dispatch,
      dragState({ a: { rotation: 30, vertices: {} }, b: { rotation: 0, vertices: {} }, c: { x: 0 } }),
      canvasRefs,
    );
    commitResizedVectorNodeSnapshots(dispatch, dragState({ b: { rotation: 0, vertices: {} } }), refs(new Map([['b', snapshot]])));

    // result
    expect(solverMock).not.toHaveBeenCalled();
    expect(resizeVectorNodeMock).toHaveBeenCalledTimes(3);
  });

  it('should do nothing without snapshots', () => {
    // before
    commitResizedVectorNodeSnapshots(vi.fn(), dragState({}), refs(null));

    // result
    expect(resizeVectorNodeMock).not.toHaveBeenCalled();
  });
});
