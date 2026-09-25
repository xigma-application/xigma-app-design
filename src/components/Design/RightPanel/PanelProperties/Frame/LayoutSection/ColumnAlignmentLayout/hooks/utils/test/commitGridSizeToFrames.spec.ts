// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TFrameNode } from 'types/design/types';

// utils
import { commitGridSizeToFrames } from '../commitGridSizeToFrames';

const resolveMock = vi.fn();
const columnMock = vi.fn();
const rowMock = vi.fn();
const spanMock = vi.fn();
const repackMock = vi.fn();

vi.mock('store/design/utils/autoLayout/getGridResizeRepack', () => ({
  resolveGridResize: (...args: unknown[]): unknown => resolveMock(...args),
}));
vi.mock('../commitGridColumnCountChange', () => ({ commitGridColumnCountChange: (...args: unknown[]): unknown => columnMock(...args) }));
vi.mock('../commitGridRowCountChange', () => ({ commitGridRowCountChange: (...args: unknown[]): unknown => rowMock(...args) }));
vi.mock('../commitGridSpanReset', () => ({ commitGridSpanReset: (...args: unknown[]): unknown => spanMock(...args) }));
vi.mock('../commitGridRepackedAnchors', () => ({ commitGridRepackedAnchors: (...args: unknown[]): unknown => repackMock(...args) }));

describe('commitGridSizeToFrames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should resize every grid that can fit its children, as one undo step', () => {
    // mock
    const dispatch = vi.fn();
    const frames = [{ id: 'a' }, { id: 'b' }, { id: 'c' }] as TFrameNode[];
    resolveMock.mockImplementation((frame: TFrameNode) =>
      frame.id === 'c' ? { ok: false } : { ok: true, repacked: `repacked-${frame.id}`, spanReset: `span-${frame.id}` },
    );

    // before
    commitGridSizeToFrames(dispatch, frames, {}, (frame) => ({ columns: 3, rows: frame.id === 'a' ? 2 : undefined }));

    // result
    expect(dispatch).toHaveBeenNthCalledWith(1, beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    expect(columnMock).toHaveBeenCalledTimes(2);
    expect(rowMock).toHaveBeenCalledTimes(1);
    expect(rowMock).toHaveBeenCalledWith(dispatch, frames[0], 2);
    expect(spanMock).toHaveBeenCalledWith(dispatch, 'span-b');
    expect(repackMock).toHaveBeenCalledWith(dispatch, 'repacked-a');
    expect(dispatch).toHaveBeenLastCalledWith(endHistoryGesture());
  });
});
