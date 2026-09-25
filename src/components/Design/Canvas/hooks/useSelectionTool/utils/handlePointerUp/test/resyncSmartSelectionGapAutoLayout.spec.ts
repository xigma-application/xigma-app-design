// types
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { resyncSmartSelectionGapAutoLayout } from '../resyncSmartSelectionGapAutoLayout';

const resyncMock = vi.fn();

vi.mock('../resyncGroupAutoLayoutAncestors', () => ({
  resyncGroupAutoLayoutAncestors: (...args: unknown[]): unknown => resyncMock(...args),
}));

describe('resyncSmartSelectionGapAutoLayout', () => {
  it('should resync the auto layout ancestors of every moved node', () => {
    // mock
    const dispatch = vi.fn();

    // before
    resyncSmartSelectionGapAutoLayout(dispatch, { nodeOrigins: { a: {}, b: {} } } as unknown as TSmartSelectionGapDragState);

    // result
    expect(resyncMock).toHaveBeenCalledWith(dispatch, ['a', 'b']);
  });
});
