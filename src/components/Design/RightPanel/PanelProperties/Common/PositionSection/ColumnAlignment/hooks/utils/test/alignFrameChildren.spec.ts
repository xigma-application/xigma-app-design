// store
import { AppDispatch } from 'store';

// types
import { AlignmentHorizontal, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { alignFrameChildren } from '../alignFrameChildren';

describe('alignFrameChildren', () => {
  it('should dispatch nothing without a frame', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // action
    alignFrameChildren(dispatch, {}, undefined, { horizontal: AlignmentHorizontal.left });

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should skip child ids that no longer exist', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;
    const frame = {
      childIds: ['missing'],
      height: 100,
      id: 'frame',
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    } as TFrameNode;
    const nodes: Record<string, TSceneNode> = { frame };

    // action
    alignFrameChildren(dispatch, nodes, frame, { horizontal: AlignmentHorizontal.left });

    // result
    expect(dispatch).toHaveBeenCalledTimes(2);
  });
});
