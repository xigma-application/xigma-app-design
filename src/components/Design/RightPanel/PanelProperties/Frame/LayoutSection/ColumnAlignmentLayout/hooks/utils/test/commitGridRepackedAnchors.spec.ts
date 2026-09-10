// store
import { updateNode } from 'store/design/slice';

// utils
import { commitGridRepackedAnchors } from '../commitGridRepackedAnchors';

describe('commitGridRepackedAnchors', () => {
  it('should dispatch an anchor update for each repacked cell', () => {
    // mock
    const dispatch = vi.fn();

    // action
    commitGridRepackedAnchors(dispatch, [
      { column: 0, id: 'a', row: 1 },
      { column: 1, id: 'b', row: 2 },
    ]);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1 }, id: 'a' }));
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 2 }, id: 'b' }));
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('should dispatch nothing for an empty list', () => {
    // mock
    const dispatch = vi.fn();

    // action
    commitGridRepackedAnchors(dispatch, []);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
