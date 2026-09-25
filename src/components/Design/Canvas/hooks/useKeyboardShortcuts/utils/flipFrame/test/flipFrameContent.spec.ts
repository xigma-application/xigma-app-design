// store
import { addNodes, moveNodes, updateNode } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { AlignmentHorizontal, LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { flipFrameContent } from '../flipFrameContent';

const flipLeafNodeMock = vi.fn();
const gridChangesMock = vi.fn();
const wrapOrderMock = vi.fn();

vi.mock('../flipLeafNode', () => ({ flipLeafNode: (...args: unknown[]): unknown => flipLeafNodeMock(...args) }));
vi.mock('../getFlippedGridChildChanges', () => ({ getFlippedGridChildChanges: (...args: unknown[]): unknown => gridChangesMock(...args) }));
vi.mock('../getReversedWrapLineOrder', () => ({ getReversedWrapLineOrder: (...args: unknown[]): unknown => wrapOrderMock(...args) }));

const frame = (id: string, extra: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [],
  height: 100,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
  ...extra,
});

const rect = (id: string, parentId: string | null, x: number): TSceneNode =>
  ({ fills: [], height: 10, id, name: id, parentId, rotation: 0, type: NodeType.rectangle, width: 10, x, y: 0 }) as TSceneNode;

const dispatch = vi.fn((action) => store.dispatch(action));

describe('flipFrameContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gridChangesMock.mockReturnValue([]);
    wrapOrderMock.mockReturnValue(null);
  });

  it('should mirror the constraints of free children around the frame center and flip nested frames through the tree', () => {
    // mock
    const flipFrameTree = vi.fn();
    store.dispatch(
      addNodes({
        nodes: [
          frame('ffc-frame', { childIds: ['ffc-rect', 'ffc-inner', 'ffc-missing'] }),
          { ...rect('ffc-rect', 'ffc-frame', 20), alignment: { horizontal: AlignmentHorizontal.left } } as TSceneNode,
          frame('ffc-inner', { parentId: 'ffc-frame', width: 20 }),
        ],
        rootIds: ['ffc-frame'],
      }),
    );

    // before
    flipFrameContent(dispatch, 'ffc-frame', 'horizontal', flipFrameTree);

    // result
    expect(selectNodes(store.getState())['ffc-rect']).toMatchObject({ alignment: { horizontal: AlignmentHorizontal.right } });
    expect(flipLeafNodeMock).toHaveBeenCalledWith(dispatch, expect.objectContaining({ id: 'ffc-rect' }), { x: 100, y: 50 }, -1, 1, false);
    expect(flipFrameTree).toHaveBeenCalledWith(dispatch, 'ffc-inner', 'horizontal', { x: 100, y: 50 });
  });

  it('should flip auto layout children in place around their own center', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          frame('ffc-auto', { childIds: ['ffc-flow', 'ffc-line'], layoutMode: LayoutMode.horizontal }),
          rect('ffc-flow', 'ffc-auto', 0),
        ],
        rootIds: ['ffc-auto'],
      }),
    );
    store.dispatch(
      addNodes({
        nodes: [
          {
            id: 'ffc-line',
            name: 'Line',
            parentId: 'ffc-auto',
            strokeWidth: 1,
            strokes: [{ color: '#000', opacity: 100, type: 'solid' }],
            type: NodeType.line,
            x1: 0,
            x2: 10,
            y1: 0,
            y2: 0,
          } as TSceneNode,
        ],
        rootIds: [],
      }),
    );

    // before
    flipFrameContent(dispatch, 'ffc-auto', 'vertical', vi.fn());

    // result
    expect(flipLeafNodeMock).toHaveBeenCalledWith(
      dispatch,
      expect.objectContaining({ id: 'ffc-flow' }),
      expect.objectContaining({ y: 5 }),
      1,
      -1,
      false,
    );
    expect(flipLeafNodeMock).toHaveBeenCalledWith(dispatch, expect.objectContaining({ id: 'ffc-line' }), expect.anything(), 1, -1, false);
  });

  it('should re-anchor grid children and pin the grid, and reverse wrapped lines', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [frame('ffc-grid', { childIds: ['ffc-cell'], layoutMode: LayoutMode.grid }), rect('ffc-cell', 'ffc-grid', 0)],
        rootIds: ['ffc-grid'],
      }),
    );
    gridChangesMock.mockReturnValue([{ changes: { gridRowAnchorIndex: 3 }, id: 'ffc-cell' }]);
    wrapOrderMock.mockReturnValue(['ffc-cell']);

    // before
    flipFrameContent(dispatch, 'ffc-grid', 'vertical', vi.fn());

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { gridRowAnchorIndex: 3 }, id: 'ffc-cell' }));
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { gridAutoPlacement: false }, id: 'ffc-grid' }));
    expect(dispatch).toHaveBeenCalledWith(moveNodes({ nodeIds: ['ffc-cell'], targetIndex: 0, targetParentId: 'ffc-grid' }));
  });
});
