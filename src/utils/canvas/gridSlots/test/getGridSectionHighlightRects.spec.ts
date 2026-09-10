// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getGridSectionHighlightRects } from '../getGridSectionHighlightRects';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 2,
  gridRowCount: 3,
  height: 300,
  id: 'frame-1',
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

describe('getGridSectionHighlightRects', () => {
  it('should return one rect per in-grid cell plus the enclosing outline', () => {
    const result = getGridSectionHighlightRects(frame(), {}, [
      { column: 1, row: 0 },
      { column: 1, row: 1 },
      { column: 1, row: 2 },
    ]);

    expect(result.cellRects).toEqual([
      { height: 100, width: 100, x: 100, y: 0 },
      { height: 100, width: 100, x: 100, y: 100 },
      { height: 100, width: 100, x: 100, y: 200 },
    ]);
    expect(result.outlineRect).toEqual({ height: 300, width: 100, x: 100, y: 0 });
  });

  it('should enclose a rectangular block of rows across every column', () => {
    const result = getGridSectionHighlightRects(frame(), {}, [
      { column: 0, row: 0 },
      { column: 1, row: 0 },
    ]);

    expect(result.outlineRect).toEqual({ height: 100, width: 200, x: 0, y: 0 });
  });

  it('should drop cells that fall outside the current grid', () => {
    const result = getGridSectionHighlightRects(frame(), {}, [
      { column: 1, row: 0 },
      { column: 5, row: 0 },
      { column: 0, row: 9 },
    ]);

    expect(result.cellRects).toEqual([{ height: 100, width: 100, x: 100, y: 0 }]);
    expect(result.outlineRect).toEqual({ height: 100, width: 100, x: 100, y: 0 });
  });

  it('should return nothing when no cell is inside the grid', () => {
    expect(getGridSectionHighlightRects(frame(), {}, [{ column: 9, row: 9 }])).toEqual({ cellRects: [], outlineRect: null });
  });

  it('should return nothing for an empty cell list', () => {
    expect(getGridSectionHighlightRects(frame(), {}, [])).toEqual({ cellRects: [], outlineRect: null });
  });
});
