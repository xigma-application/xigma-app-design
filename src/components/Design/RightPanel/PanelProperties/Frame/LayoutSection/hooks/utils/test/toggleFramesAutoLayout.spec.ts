// store
import { updateNode } from 'store/design/slice';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { toggleFramesAutoLayout } from '../toggleFramesAutoLayout';

const frame = (id: string, layoutMode?: LayoutMode): TFrameNode => ({ id, layoutMode, type: NodeType.frame }) as TFrameNode;

describe('toggleFramesAutoLayout', () => {
  it('should turn auto layout off for every frame', () => {
    // mock
    const dispatch = vi.fn();

    // before
    toggleFramesAutoLayout(dispatch, [frame('a', LayoutMode.vertical)], true);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { layoutMode: LayoutMode.freeForm }, id: 'a' }));
  });

  it('should turn free-form frames into rows and leave managed ones alone', () => {
    // mock
    const dispatch = vi.fn();

    // before
    toggleFramesAutoLayout(dispatch, [frame('free'), frame('grid', LayoutMode.grid)], false);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { layoutMode: LayoutMode.horizontal }, id: 'free' }));
    expect(dispatch).toHaveBeenCalledTimes(3);
  });
});
