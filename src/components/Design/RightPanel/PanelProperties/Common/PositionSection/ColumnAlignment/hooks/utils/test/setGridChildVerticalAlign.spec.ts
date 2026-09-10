// store
import { updateNode } from 'store/design/slice';

// types
import { AlignmentVertical, NodeType } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';

// utils
import { setGridChildVerticalAlign } from '../setGridChildVerticalAlign';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

const node = (overrides: Partial<TBoxSceneNode> = {}): TBoxSceneNode =>
  ({
    fill: '#fff',
    height: 20,
    id: 'node-1',
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 20,
    x: 0,
    y: 0,
    ...overrides,
  }) as TBoxSceneNode;

describe('setGridChildVerticalAlign', () => {
  it('should dispatch updateNode with the node id and the new vertical align', () => {
    const dispatch = vi.fn();

    setGridChildVerticalAlign(dispatch, node(), AlignmentVertical.bottom);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridChildVerticalAlign: AlignmentVertical.bottom }, id: 'node-1' });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch when no node is selected', () => {
    const dispatch = vi.fn();

    setGridChildVerticalAlign(dispatch, undefined, AlignmentVertical.bottom);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
