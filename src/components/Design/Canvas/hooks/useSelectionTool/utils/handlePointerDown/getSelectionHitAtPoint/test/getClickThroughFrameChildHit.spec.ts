// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { getClickThroughFrameChildHit } from '../getClickThroughFrameChildHit';

const nodeAtPointMock = vi.fn();

vi.mock('../../../../../../utils/getClickThroughLeafNodes', () => ({ getClickThroughLeafNodes: (): string[] => ['candidates'] }));
vi.mock('../../../../../../utils/getNodeAtPoint/getNodeAtPoint', () => ({
  getNodeAtPoint: (...args: unknown[]): unknown => nodeAtPointMock(...args),
}));

const nodesById = {
  child: { id: 'child', parentId: 'frame' },
  frame: { id: 'frame', parentId: null },
  other: { id: 'other', parentId: null },
} as unknown as Record<string, TSceneNode>;
const viewport = { x: 0, y: 0, zoom: 1 };

describe('getClickThroughFrameChildHit', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should return the leaf under the pointer when it lies inside the frame', () => {
    // mock
    nodeAtPointMock.mockReturnValue(nodesById.child);

    // result
    expect(getClickThroughFrameChildHit(nodesById.frame, { x: 1, y: 2 }, viewport, nodesById)).toBe(nodesById.child);
    expect(nodeAtPointMock).toHaveBeenCalledWith({ x: 1, y: 2 }, ['candidates'], viewport, { clipNodesById: nodesById });
  });

  it('should return nothing for a leaf outside the frame, one being vector-edited, or no leaf', () => {
    // mock
    nodeAtPointMock.mockReturnValueOnce(nodesById.other).mockReturnValueOnce(nodesById.child).mockReturnValueOnce(null);

    // result
    expect(getClickThroughFrameChildHit(nodesById.frame, { x: 1, y: 2 }, viewport, nodesById)).toBeNull();
    store.dispatch(setVectorEditingNodeIds(['child']));
    expect(getClickThroughFrameChildHit(nodesById.frame, { x: 1, y: 2 }, viewport, nodesById)).toBeNull();
    expect(getClickThroughFrameChildHit(nodesById.frame, { x: 1, y: 2 }, viewport, nodesById)).toBeNull();
  });
});
