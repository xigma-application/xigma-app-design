// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getGridGeometry } from '../getGridGeometry';

const cell = (x: number, y: number, width = 50, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id: `${x},${y}` });

describe('getGridGeometry', () => {
  it('should read each column x/width and each row y/height off a clean grid', () => {
    const cells = [
      [cell(0, 0), cell(100, 0)],
      [cell(0, 100), cell(100, 100)],
    ];

    expect(getGridGeometry(cells)).toEqual({ columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50, 50], rowY: [0, 100] });
  });

  it('should keep per-column widths and per-row heights when they differ', () => {
    const cells = [
      [cell(0, 0, 50, 40), cell(100, 0, 80, 40)],
      [cell(0, 100, 50, 60), cell(100, 100, 80, 60)],
    ];

    expect(getGridGeometry(cells)).toEqual({ columnWidth: [50, 80], columnX: [0, 100], rowHeight: [40, 60], rowY: [0, 100] });
  });

  it('should fall back to the first real cell in a row or column that has a hole', () => {
    const cells: (TSmartSelectionNode | null)[][] = [
      [null, cell(100, 0)],
      [cell(0, 100), null],
    ];

    expect(getGridGeometry(cells)).toEqual({ columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50, 50], rowY: [0, 100] });
  });
});
