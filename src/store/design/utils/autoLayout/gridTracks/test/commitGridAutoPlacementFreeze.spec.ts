// store
import { updateNode } from 'store/design/slice';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { commitGridAutoPlacementFreeze } from '../commitGridAutoPlacementFreeze';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

const frame = (childIds: string[]): TFrameNode =>
  ({
    childIds,
    clipContent: true,
    fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
    gridColumnCount: 2,
    height: 200,
    id: 'grid-1',
    layoutMode: LayoutMode.grid,
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 200,
    x: 0,
    y: 0,
  }) as TFrameNode;

const child = (id: string): TSceneNode =>
  ({
    fill: '#000',
    height: 10,
    id,
    name: id,
    parentId: 'grid-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const byId = (nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('commitGridAutoPlacementFreeze', () => {
  it('should dispatch an anchor update for every child, stamped with its current auto-flowed cell', () => {
    const dispatch = vi.fn();
    const nodes = byId([child('a'), child('b'), child('c')]);

    commitGridAutoPlacementFreeze(dispatch, frame(['a', 'b', 'c']), nodes);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0 }, id: 'a' });
    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0 }, id: 'b' });
    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1 }, id: 'c' });
    expect(dispatch).toHaveBeenCalledTimes(3);
  });

  it('should dispatch nothing for an empty grid', () => {
    const dispatch = vi.fn();

    commitGridAutoPlacementFreeze(dispatch, frame([]), {});

    expect(dispatch).not.toHaveBeenCalled();
  });
});
