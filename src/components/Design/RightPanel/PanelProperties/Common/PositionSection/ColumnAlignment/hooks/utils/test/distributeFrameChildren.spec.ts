// store
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { distributeFrameChildren } from '../distributeFrameChildren';

const box = (id: string, x: number, y: number, width: number, height: number): TSceneNode =>
  ({ childIds: [], height, id, rotation: 0, type: NodeType.frame, width, x, y }) as unknown as TSceneNode;

const updatedChanges = (dispatch: ReturnType<typeof vi.fn>): unknown[] =>
  dispatch.mock.calls
    .map(([action]) => action)
    .filter((action) => action.type === 'design/updateNode')
    .map((action) => action.payload);

describe('distributeFrameChildren', () => {
  it('should dispatch nothing without a frame', () => {
    // mock
    const dispatch = vi.fn();

    // action
    distributeFrameChildren(dispatch as unknown as AppDispatch, {}, undefined, 'horizontal');

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should order children by position, not by layer order, and even out the vertical gaps between differently sized children', () => {
    // mock
    const dispatch = vi.fn();
    const nodes = { a: box('a', 0, 200, 10, 40), b: box('b', 0, 0, 10, 20), c: box('c', 0, 30, 10, 10) };
    const frame = { childIds: ['a', 'b', 'c'], id: 'frame' } as TFrameNode;

    // action
    distributeFrameChildren(dispatch as unknown as AppDispatch, nodes, frame, 'vertical');

    // result: span 0..240, 70 of content, so two 85px gaps
    expect(updatedChanges(dispatch)).toEqual([
      { changes: { y: 0 }, id: 'b' },
      { changes: { y: 105 }, id: 'c' },
      { changes: { y: 200 }, id: 'a' },
    ]);
  });
});
