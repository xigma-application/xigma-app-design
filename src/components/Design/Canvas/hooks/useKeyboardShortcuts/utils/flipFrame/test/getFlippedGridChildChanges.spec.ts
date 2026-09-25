// types
import { AlignmentHorizontal, AlignmentVertical, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getFlippedGridChildChanges } from '../getFlippedGridChildChanges';

const placeGridCellsMock = vi.fn();

vi.mock('store/design/utils/autoLayout/getGridPlacementInputs', () => ({ getGridPlacementInputs: (): string => 'inputs' }));
vi.mock('store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/placeGridCells', () => ({
  placeGridCells: (...args: unknown[]): unknown => placeGridCellsMock(...args),
}));

const nodesById = {
  a: {
    gridChildHorizontalAlign: AlignmentHorizontal.left,
    gridChildVerticalAlign: AlignmentVertical.top,
    id: 'a',
    type: NodeType.rectangle,
    x: 0,
    y: 0,
  },
  b: { id: 'b', type: NodeType.rectangle, x: 0, y: 0 },
  line: { id: 'line', type: NodeType.line },
} as unknown as Record<string, TSceneNode>;

describe('getFlippedGridChildChanges', () => {
  beforeEach(() => {
    placeGridCellsMock.mockReturnValue([
      { columnSpan: 1, columnStart: 0, id: 'a', rowSpan: 1, rowStart: 0 },
      { columnSpan: 2, columnStart: 1, id: 'b', rowSpan: 2, rowStart: 1 },
      { columnSpan: 1, columnStart: 2, id: 'line', rowSpan: 1, rowStart: 2 },
    ]);
  });

  it('should mirror the column of every child and its horizontal alignment for a horizontal flip', () => {
    // mock
    const frame = { childIds: ['a', 'b', 'line'], gridAutoPlacement: false, gridColumnCount: 3 } as TFrameNode;

    // result
    expect(getFlippedGridChildChanges(frame, nodesById, 'horizontal')).toEqual([
      { changes: { gridChildHorizontalAlign: AlignmentHorizontal.right, gridColumnAnchorIndex: 2, gridRowAnchorIndex: 0 }, id: 'a' },
      { changes: { gridChildHorizontalAlign: AlignmentHorizontal.right, gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1 }, id: 'b' },
      { changes: { gridChildHorizontalAlign: AlignmentHorizontal.right, gridColumnAnchorIndex: 0, gridRowAnchorIndex: 2 }, id: 'line' },
    ]);
    expect(placeGridCellsMock).toHaveBeenCalledWith('inputs', 3, false);
  });

  it('should mirror the row of every child across the rows in use for a vertical flip, defaulting to one column', () => {
    // mock
    const frame = { childIds: ['a', 'b', 'line'] } as TFrameNode;

    // result
    expect(getFlippedGridChildChanges(frame, nodesById, 'vertical')).toEqual([
      { changes: { gridChildVerticalAlign: AlignmentVertical.bottom, gridColumnAnchorIndex: 0, gridRowAnchorIndex: 2 }, id: 'a' },
      { changes: { gridChildVerticalAlign: AlignmentVertical.bottom, gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0 }, id: 'b' },
      { changes: { gridChildVerticalAlign: AlignmentVertical.bottom, gridColumnAnchorIndex: 2, gridRowAnchorIndex: 0 }, id: 'line' },
    ]);
    expect(placeGridCellsMock).toHaveBeenCalledWith('inputs', 1, true);
  });
});
