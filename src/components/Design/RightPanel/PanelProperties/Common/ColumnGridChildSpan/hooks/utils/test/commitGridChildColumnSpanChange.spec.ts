// store
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';

// utils
import { commitGridChildColumnSpanChange } from '../commitGridChildColumnSpanChange';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

const node = (overrides: Partial<TBoxSceneNode> = {}): TBoxSceneNode =>
  ({
    fill: '#000',
    height: 10,
    id: 'rect-1',
    name: 'Rectangle',
    parentId: 'frame-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TBoxSceneNode;

describe('commitGridChildColumnSpanChange', () => {
  it('should dispatch updateNode with the node id and the new column span', () => {
    const dispatch = vi.fn();

    commitGridChildColumnSpanChange(dispatch, node(), 3);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSpan: 3 }, id: 'rect-1' });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch when there is no node', () => {
    const dispatch = vi.fn();

    commitGridChildColumnSpanChange(dispatch, undefined, 3);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
