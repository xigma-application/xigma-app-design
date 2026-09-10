// store
import { updateNode } from 'store/design/slice';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { applyGridInsert } from '../applyGridInsert';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: ['a', 'b'],
  clipContent: true,
  fill: '#fff',
  gridAutoPlacement: false,
  gridColumnCount: 2,
  gridRowCount: 2,
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
  ...overrides,
});

const anchored = (id: string, column: number, row: number): TSceneNode =>
  ({
    fill: '#000',
    gridColumnAnchorIndex: column,
    gridRowAnchorIndex: row,
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

const nodesById = { a: anchored('a', 0, 0), b: anchored('b', 1, 0) };

describe('applyGridInsert', () => {
  it('should turn automatic placement off for the frame', () => {
    // mock
    const dispatch = vi.fn();

    // action
    applyGridInsert(dispatch, frame(), nodesById, 1, ['d1']);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { gridAutoPlacement: false }, id: 'grid-1' }));
  });

  it('should re-anchor each shifted child without touching its sizing', () => {
    // mock
    const dispatch = vi.fn();

    // action — inserting at reading index 1 pushes "b" into the next row
    applyGridInsert(dispatch, frame(), nodesById, 1, ['d1']);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1 }, id: 'b' }));
  });

  it('should pin the dragged node to its insert cell and stretch it to fill', () => {
    // mock
    const dispatch = vi.fn();

    // action
    applyGridInsert(dispatch, frame(), nodesById, 1, ['d1']);

    // result
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({
        changes: {
          gridColumnAnchorIndex: 1,
          gridRowAnchorIndex: 0,
          heightSizingMode: SizingMode.fill,
          widthSizingMode: SizingMode.fill,
        },
        id: 'd1',
      }),
    );
  });
});
