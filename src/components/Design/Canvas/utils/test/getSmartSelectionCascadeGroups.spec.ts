// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getSmartSelectionCascadeGroups } from '../getSmartSelectionCascadeGroups';

const node = (id: string, x: number, y: number, width = 50, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('getSmartSelectionCascadeGroups', () => {
  it('should treat the first node as the fixed anchor for a row layout', () => {
    const layout = { gaps: [], nodes: [node('a', 0, 0), node('b', 100, 0), node('c', 200, 0)], type: 'row' as const };

    const setup = getSmartSelectionCascadeGroups(layout, 'x');

    expect(setup.anchorPosition).toBe(0);
    expect(setup.anchorSize).toBe(50);
    expect(setup.cascadeGroups).toEqual([
      { nodeIds: ['b'], originalPosition: 100, size: 50 },
      { nodeIds: ['c'], originalPosition: 200, size: 50 },
    ]);
  });

  it('should treat the first node as the fixed anchor for a column layout', () => {
    const layout = { gaps: [], nodes: [node('a', 0, 0), node('b', 0, 100)], type: 'column' as const };

    const setup = getSmartSelectionCascadeGroups(layout, 'y');

    expect(setup.anchorPosition).toBe(0);
    expect(setup.anchorSize).toBe(50);
    expect(setup.cascadeGroups).toEqual([{ nodeIds: ['b'], originalPosition: 100, size: 50 }]);
  });

  it('should group every cell in a column together for a grid column-gap axis', () => {
    const layout = {
      cells: [
        [node('a', 0, 0), node('b', 100, 0)],
        [node('c', 0, 100), node('d', 100, 100)],
      ],
      columnCount: 2,
      columnGaps: [],
      geometry: { columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50, 50], rowY: [0, 100] },
      rowCount: 2,
      rowGaps: [],
      type: 'grid' as const,
    };

    const setup = getSmartSelectionCascadeGroups(layout, 'x');

    expect(setup.anchorPosition).toBe(0);
    expect(setup.anchorSize).toBe(50);
    expect(setup.cascadeGroups).toEqual([{ nodeIds: ['b', 'd'], originalPosition: 100, size: 50 }]);
  });

  it('should group every cell in a row together for a grid row-gap axis', () => {
    const layout = {
      cells: [
        [node('a', 0, 0), node('b', 100, 0)],
        [node('c', 0, 100), node('d', 100, 100)],
      ],
      columnCount: 2,
      columnGaps: [],
      geometry: { columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50, 50], rowY: [0, 100] },
      rowCount: 2,
      rowGaps: [],
      type: 'grid' as const,
    };

    const setup = getSmartSelectionCascadeGroups(layout, 'y');

    expect(setup.anchorPosition).toBe(0);
    expect(setup.anchorSize).toBe(50);
    expect(setup.cascadeGroups).toEqual([{ nodeIds: ['c', 'd'], originalPosition: 100, size: 50 }]);
  });

  it('should skip empty cells when grouping a grid axis, and anchor off the grid geometry', () => {
    const layout = {
      cells: [
        [node('a', 0, 0), node('b', 100, 0)],
        [node('c', 0, 100), null],
      ],
      columnCount: 2,
      columnGaps: [],
      geometry: { columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50, 50], rowY: [0, 100] },
      rowCount: 2,
      rowGaps: [],
      type: 'grid' as const,
    };

    const setup = getSmartSelectionCascadeGroups(layout, 'x');

    expect(setup.anchorPosition).toBe(0);
    expect(setup.anchorSize).toBe(50);
    expect(setup.cascadeGroups).toEqual([{ nodeIds: ['b'], originalPosition: 100, size: 50 }]);
  });
});
