// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TGridDropHover } from 'utils/canvas/gridSlots/resolveGridDropHover/types';

// utils
import { getGridAutoInsertIndex } from '../getGridAutoInsertIndex';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  gridColumnCount: 3,
  height: 100,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getGridAutoInsertIndex', () => {
  it('should use the explicit insertIndex when the drop hover already resolved one', () => {
    // before
    const result = getGridAutoInsertIndex(buildFrame(), { cells: [], insertIndex: 5 } as TGridDropHover);

    // result
    expect(result).toBe(5);
  });

  it('should derive the index from the first hovered cell’s row/column, when no explicit insertIndex is given', () => {
    // before — 3 columns per row: row 1, column 2 -> index 1*3 + 2 = 5
    const result = getGridAutoInsertIndex(buildFrame(), { cells: [{ column: 2, row: 1 }] } as TGridDropHover);

    // result
    expect(result).toBe(5);
  });

  it('should fall back to appending at the end of the frame’s children when there is no hovered cell either', () => {
    // before
    const result = getGridAutoInsertIndex(buildFrame({ childIds: ['a', 'b', 'c'] }), { cells: [] } as unknown as TGridDropHover);

    // result
    expect(result).toBe(3);
  });

  it('should default to a single column when the frame has no gridColumnCount set', () => {
    // before — with 1 column, row 2 column 0 -> index 2
    const result = getGridAutoInsertIndex(buildFrame({ gridColumnCount: undefined }), { cells: [{ column: 0, row: 2 }] } as TGridDropHover);

    // result
    expect(result).toBe(2);
  });
});
