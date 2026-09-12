// store
import { updateNode } from 'store/design/slice';

// types
import { SizingMode } from 'types/design/enums';

// utils
import { fillSizeNodesForGridAutoInsert } from '../fillSizeNodesForGridAutoInsert';

describe('fillSizeNodesForGridAutoInsert', () => {
  it('should stretch each given node to fill on both axes', () => {
    // mock
    const dispatch = vi.fn();

    // action
    fillSizeNodesForGridAutoInsert(dispatch, ['a', 'b']);

    // result
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({ changes: { heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill }, id: 'a' }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({ changes: { heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill }, id: 'b' }),
    );
  });

  it('should not dispatch anything when there are no nodes', () => {
    // mock
    const dispatch = vi.fn();

    // action
    fillSizeNodesForGridAutoInsert(dispatch, []);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
