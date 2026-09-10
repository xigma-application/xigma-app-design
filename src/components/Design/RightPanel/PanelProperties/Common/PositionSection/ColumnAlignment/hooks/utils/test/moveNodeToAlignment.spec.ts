// store
import { updateNode } from 'store/design/slice';

// types
import { AlignmentHorizontal, AlignmentVertical, NodeType } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';

// utils
import { moveNodeToAlignment } from '../moveNodeToAlignment';

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

const parent = (): Parameters<typeof moveNodeToAlignment>[2] => ({ height: 100, rotation: 0, width: 200, x: 100, y: 50 });

describe('moveNodeToAlignment', () => {
  it('should reposition the node to the aligned local position within its parent', () => {
    const dispatch = vi.fn();

    moveNodeToAlignment(dispatch, node(), parent(), { horizontal: AlignmentHorizontal.left, vertical: AlignmentVertical.top });

    expect(updateNode).toHaveBeenCalledWith({
      changes: { alignment: { horizontal: AlignmentHorizontal.left, vertical: AlignmentVertical.top }, x: 100, y: 50 },
      id: 'node-1',
    });
  });

  it('should fall back to committing the alignment constraint without moving when there is no parent', () => {
    const dispatch = vi.fn();

    moveNodeToAlignment(dispatch, node(), undefined, { horizontal: AlignmentHorizontal.right, vertical: undefined });

    expect(updateNode).toHaveBeenCalledWith({
      changes: { alignment: { horizontal: AlignmentHorizontal.right, vertical: undefined } },
      id: 'node-1',
    });
  });

  it('should not dispatch when no node is selected', () => {
    const dispatch = vi.fn();

    moveNodeToAlignment(dispatch, undefined, parent(), { horizontal: AlignmentHorizontal.left, vertical: AlignmentVertical.top });

    expect(dispatch).not.toHaveBeenCalled();
  });
});
