// types
import { TResizeDragFrame } from '../getResizeDragFrame';
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { resizeOriginEntries } from '../resizeOriginEntries';

const resizeNodeMock = vi.fn();
const updateSnapshotMock = vi.fn();

vi.mock('../resizeNode/resizeNode', () => ({ resizeNode: (...args: unknown[]): unknown => resizeNodeMock(...args) }));
vi.mock('../updateResizedVectorNodeSnapshot', () => ({
  updateResizedVectorNodeSnapshot: (...args: unknown[]): unknown => updateSnapshotMock(...args),
}));

const frame = { anchors: { x: 0, y: 0 }, rotatedAnchorSolver: null, scaleX: 2, scaleY: 3 } as TResizeDragFrame;

describe('resizeOriginEntries', () => {
  it('should update the snapshot of a snapshotted vector and resize every other node', () => {
    // mock
    const dispatch = vi.fn();
    const vectorOrigin = { vertices: {} } as unknown as TResizeNodeOrigin;
    const boxOrigin = { x: 0, y: 0 } as unknown as TResizeNodeOrigin;
    const snapshot = {} as TVectorNodeResizeSnapshot;

    // before
    resizeOriginEntries(
      [
        ['vector', vectorOrigin],
        ['box', boxOrigin],
        ['vector-no-snapshot', vectorOrigin],
      ],
      dispatch,
      frame,
      true,
      new Map([['vector', snapshot]]),
    );

    // result
    expect(updateSnapshotMock).toHaveBeenCalledWith(snapshot, vectorOrigin, { x: 0, y: 0 }, 2, 3, null);
    expect(resizeNodeMock).toHaveBeenCalledWith('box', boxOrigin, dispatch, { x: 0, y: 0 }, 2, 3, true, null);
    expect(resizeNodeMock).toHaveBeenCalledWith('vector-no-snapshot', vectorOrigin, dispatch, { x: 0, y: 0 }, 2, 3, true, null);
  });

  it('should resize directly without snapshots, even for a snapshot with a non-vector origin', () => {
    // mock
    resizeNodeMock.mockClear();
    const boxOrigin = { x: 0, y: 0 } as unknown as TResizeNodeOrigin;

    // before
    resizeOriginEntries([['box', boxOrigin]], vi.fn(), frame, false, null);
    resizeOriginEntries([['box', boxOrigin]], vi.fn(), frame, false, new Map([['box', {} as TVectorNodeResizeSnapshot]]));

    // result
    expect(resizeNodeMock).toHaveBeenCalledTimes(2);
  });
});
