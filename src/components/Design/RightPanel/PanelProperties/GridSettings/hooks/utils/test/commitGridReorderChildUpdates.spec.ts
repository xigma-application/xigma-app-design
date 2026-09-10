// store
import { updateNode } from 'store/design/slice';

// utils
import { commitGridReorderChildUpdates } from '../commitGridReorderChildUpdates';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

describe('commitGridReorderChildUpdates', () => {
  it('should dispatch a column anchor change per update', () => {
    const dispatch = vi.fn();

    commitGridReorderChildUpdates(dispatch, 'column', [
      { anchorIndex: 2, id: 'a' },
      { anchorIndex: 0, id: 'b' },
    ]);

    expect(updateNode).toHaveBeenNthCalledWith(1, { changes: { gridColumnAnchorIndex: 2 }, id: 'a' });
    expect(updateNode).toHaveBeenNthCalledWith(2, { changes: { gridColumnAnchorIndex: 0 }, id: 'b' });
  });

  it('should dispatch a row anchor change for the row axis', () => {
    const dispatch = vi.fn();

    commitGridReorderChildUpdates(dispatch, 'row', [{ anchorIndex: 1, id: 'a' }]);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridRowAnchorIndex: 1 }, id: 'a' });
  });

  it('should do nothing for an empty update list', () => {
    const dispatch = vi.fn();

    commitGridReorderChildUpdates(dispatch, 'row', []);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
