// store
import { updateNode } from 'store/design/slice';

// types
import { AlignmentHorizontal, AlignmentVertical, NodeType } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';

// utils
import { commitAlignmentConstraint } from '../commitAlignmentConstraint';

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

describe('commitAlignmentConstraint', () => {
  it('should dispatch the alignment as given when at least one axis is set', () => {
    const dispatch = vi.fn();

    commitAlignmentConstraint(dispatch, node(), { horizontal: AlignmentHorizontal.right, vertical: undefined });

    expect(updateNode).toHaveBeenCalledWith({
      changes: { alignment: { horizontal: AlignmentHorizontal.right, vertical: undefined } },
      id: 'node-1',
    });
  });

  it('should clear the alignment when both axes are undefined', () => {
    const dispatch = vi.fn();

    commitAlignmentConstraint(dispatch, node(), { horizontal: undefined, vertical: undefined });

    expect(updateNode).toHaveBeenCalledWith({ changes: { alignment: undefined }, id: 'node-1' });
  });

  it('should not dispatch when no node is selected', () => {
    const dispatch = vi.fn();

    commitAlignmentConstraint(dispatch, undefined, { horizontal: AlignmentHorizontal.left, vertical: AlignmentVertical.top });

    expect(dispatch).not.toHaveBeenCalled();
  });
});
