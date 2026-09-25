// store
import { updateNode } from 'store/design/slice';

// types
import { TSceneNode } from 'types/design/types';
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';

// utils
import { dispatchVectorMultiSelectRotateUpdates } from '../dispatchVectorMultiSelectRotateUpdates';

const gestureMock = vi.fn((_dispatch: unknown, _count: number, run: () => void) => run());

vi.mock('components/Design/Canvas/utils/dispatchAsOneGestureIfMultiNode', () => ({
  dispatchAsOneGestureIfMultiNode: (...args: unknown[]): unknown => gestureMock(...(args as [unknown, number, () => void])),
}));
vi.mock('components/Design/Canvas/utils/getVectorEditingNode', () => ({
  getVectorEditingNode: (nodes: Record<string, unknown>, id: string): unknown => nodes[id],
}));

describe('dispatchVectorMultiSelectRotateUpdates', () => {
  it('should rotate the picked vertices and handles of every node as one gesture', () => {
    // mock
    const dispatch = vi.fn();
    const nodes = {
      v: {
        id: 'v',
        segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
        vertices: { a: { id: 'a', x: 10, y: 0 }, b: { id: 'b', x: 20, y: 0 } },
      },
    } as unknown as Record<string, TSceneNode>;
    const dragState = {
      handleOrigins: { 'start:s1': { x: 5, y: 0 } },
      pivot: { x: 0, y: 0 },
      vertexOrigins: { a: { x: 10, y: 0 } },
    } as unknown as TVectorMultiSelectRotateDragState;

    // before
    dispatchVectorMultiSelectRotateUpdates(dispatch, nodes, { v: { handleKeys: ['start:s1'], vertexIds: ['a'] } } as never, dragState, 90);

    // result
    expect(gestureMock).toHaveBeenCalledWith(dispatch, 1, expect.any(Function));
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({
        changes: {
          segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: { x: 0, y: 5 } } },
          vertices: { a: { id: 'a', x: 0, y: 10 }, b: { id: 'b', x: 20, y: 0 } },
        },
        id: 'v',
      }),
    );
  });
});
