// store
import { updateNode } from 'store/design/slice';

// utils
import { commitGridDeleteChildUpdates } from '../commitGridDeleteChildUpdates';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

describe('commitGridDeleteChildUpdates', () => {
  it('should dispatch a column anchor/span change per update', () => {
    const dispatch = vi.fn();

    commitGridDeleteChildUpdates(dispatch, 'column', [
      { anchorIndex: 1, id: 'a', span: 2 },
      { anchorIndex: undefined, id: 'b', span: undefined },
    ]);

    expect(updateNode).toHaveBeenNthCalledWith(1, { changes: { gridColumnAnchorIndex: 1, gridColumnSpan: 2 }, id: 'a' });
    expect(updateNode).toHaveBeenNthCalledWith(2, { changes: { gridColumnAnchorIndex: undefined, gridColumnSpan: undefined }, id: 'b' });
  });

  it('should dispatch row anchor/span changes for the row axis', () => {
    const dispatch = vi.fn();

    commitGridDeleteChildUpdates(dispatch, 'row', [{ anchorIndex: 0, id: 'a', span: 1 }]);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridRowAnchorIndex: 0, gridRowSpan: 1 }, id: 'a' });
  });

  it('should do nothing for an empty update list', () => {
    const dispatch = vi.fn();

    commitGridDeleteChildUpdates(dispatch, 'column', []);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
