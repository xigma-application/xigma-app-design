// store
import { updateNode } from 'store/design/slice';

// types
import { LayoutMode, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { commitFlowChange } from '../commitFlowChange';

vi.mock('store/design/utils/autoLayout/getChildrenFillResetChanges', () => ({
  getChildrenFillResetChanges: (_frame: unknown, axis: string): string[] => (axis === 'width' ? ['w'] : ['h']),
}));

const frame = { id: 'f' } as TFrameNode;

describe('commitFlowChange', () => {
  it('should switch to a grid with two columns seeded', () => {
    // mock
    const dispatch = vi.fn();

    // before
    commitFlowChange(dispatch, frame, {}, LayoutMode.grid);

    // result
    expect(dispatch.mock.calls).toEqual([
      [updateNode({ changes: { gridColumnCount: 2, layoutMode: LayoutMode.grid, layoutWrap: false }, id: 'f' })],
    ]);
  });

  it('should keep an existing column count and stay managed in a row or column', () => {
    // mock
    const dispatch = vi.fn();

    // before
    commitFlowChange(dispatch, { ...frame, gridColumnCount: 4 }, {}, LayoutMode.grid);
    commitFlowChange(dispatch, frame, {}, LayoutMode.horizontal);
    commitFlowChange(dispatch, frame, {}, LayoutMode.vertical);

    // result
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch).toHaveBeenNthCalledWith(1, updateNode({ changes: { layoutMode: LayoutMode.grid, layoutWrap: false }, id: 'f' }));
  });

  it('should reset filling children to a fixed size when leaving auto layout', () => {
    // mock
    const dispatch = vi.fn();

    // before
    commitFlowChange(dispatch, frame, {}, LayoutMode.freeForm);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { widthSizingMode: SizingMode.fixed }, id: 'w' }));
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { heightSizingMode: SizingMode.fixed }, id: 'h' }));
  });
});
