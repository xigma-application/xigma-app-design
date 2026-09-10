// store
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { commitGridCellClick } from '../commitGridCellClick';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const rect = (id: string, overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fill: '#000',
    height: 10,
    id,
    name: id,
    parentId: 'frame-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('commitGridCellClick', () => {
  it('should commit both dimensions from the clicked matrix cell', () => {
    const dispatch = vi.fn();

    commitGridCellClick(dispatch, frame(), {}, { columns: 4, rows: 3 });

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnCount: 4 }, id: 'frame-1' });
    expect(updateNode).toHaveBeenCalledWith({ changes: { gridRowCount: 3 }, id: 'frame-1' });
  });

  it('should reset a spanning child back to 1x1', () => {
    const dispatch = vi.fn();
    const nodes = { a: rect('a', { gridColumnSpan: 3, gridRowSpan: 1 }) };

    commitGridCellClick(dispatch, frame({ childIds: ['a'] }), nodes, { columns: 2, rows: 2 });

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSpan: undefined, gridRowSpan: undefined }, id: 'a' });
  });

  it('should do nothing when there is no frame node', () => {
    const dispatch = vi.fn();

    commitGridCellClick(dispatch, undefined, {}, { columns: 2, rows: 2 });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should reject a click whose capacity is too small for the current children', () => {
    const dispatch = vi.fn();
    const childIds = Array.from({ length: 6 }, (_, index) => `child-${index}`);

    commitGridCellClick(dispatch, frame({ childIds }), {}, { columns: 1, rows: 1 });

    // 1x1 = 1 cell, short of the 6 children
    expect(dispatch).not.toHaveBeenCalled();
  });
});
