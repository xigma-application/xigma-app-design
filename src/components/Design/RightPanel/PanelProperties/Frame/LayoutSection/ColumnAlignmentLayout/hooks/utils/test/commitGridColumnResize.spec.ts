// store
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { commitGridColumnResize } from '../commitGridColumnResize';

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

describe('commitGridColumnResize', () => {
  it('should commit the new column count when the resize resolves', () => {
    const dispatch = vi.fn();

    commitGridColumnResize(dispatch, frame(), {}, '4', undefined);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnCount: 4 }, id: 'frame-1' });
  });

  it('should reset a spanning child back to 1x1 alongside the column count change', () => {
    const dispatch = vi.fn();
    const nodes = { a: rect('a', { gridColumnSpan: 2 }) };

    commitGridColumnResize(dispatch, frame({ childIds: ['a'] }), nodes, '4', undefined);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSpan: undefined, gridRowSpan: undefined }, id: 'a' });
  });

  it('should ignore an out-of-range value', () => {
    const dispatch = vi.fn();

    commitGridColumnResize(dispatch, frame(), {}, '999', undefined);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should do nothing when there is no frame node', () => {
    const dispatch = vi.fn();

    commitGridColumnResize(dispatch, undefined, {}, '4', undefined);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should reject a resize whose capacity is too small for the fixed row count', () => {
    const dispatch = vi.fn();
    const childIds = Array.from({ length: 6 }, (_, index) => `child-${index}`);

    commitGridColumnResize(dispatch, frame({ childIds, gridColumnCount: 2 }), {}, '1', 4);

    // 1 column x 4 fixed rows = 4 cells, short of the 6 children
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should do nothing when the committed value matches the current column count', () => {
    const dispatch = vi.fn();

    commitGridColumnResize(dispatch, frame({ gridColumnCount: 4 }), {}, '4', undefined);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
