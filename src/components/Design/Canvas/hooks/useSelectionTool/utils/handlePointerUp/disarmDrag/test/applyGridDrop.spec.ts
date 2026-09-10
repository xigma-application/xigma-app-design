// store
import { updateNode } from 'store/design/slice';

// types
import { SizingMode } from 'types/design/enums';

// utils
import { applyGridDrop } from '../applyGridDrop';

describe('applyGridDrop', () => {
  it('should turn automatic placement off for the frame', () => {
    // mock
    const dispatch = vi.fn();

    // action
    applyGridDrop(dispatch, 'grid-1', [{ column: 0, row: 0 }], ['a']);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { gridAutoPlacement: false }, id: 'grid-1' }));
  });

  it('should pin each dropped node to its resolved cell and stretch it to fill', () => {
    // mock
    const dispatch = vi.fn();

    // action
    applyGridDrop(
      dispatch,
      'grid-1',
      [
        { column: 0, row: 0 },
        { column: 1, row: 0 },
        { column: 0, row: 2 },
      ],
      ['a', 'b', 'c'],
    );

    // result
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({
        changes: { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill },
        id: 'a',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({
        changes: { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0, heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill },
        id: 'b',
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({
        changes: { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 2, heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill },
        id: 'c',
      }),
    );
  });

  it('should skip a node that has no resolved cell', () => {
    // mock
    const dispatch = vi.fn();

    // action — two nodes, only one cell
    applyGridDrop(dispatch, 'grid-1', [{ column: 0, row: 0 }], ['a', 'b']);

    // result — 'b' gets no anchor update
    const anchoredIds = dispatch.mock.calls
      .map(([action]) => action as { payload?: { id?: string; changes?: Record<string, unknown> } })
      .filter((action) => action.payload?.changes?.gridColumnAnchorIndex !== undefined)
      .map((action) => action.payload?.id);

    expect(anchoredIds).toEqual(['a']);
  });
});
