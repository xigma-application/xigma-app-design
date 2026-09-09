// types
import { TAutoLayoutChildSize } from '../../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// utils
import { placeGridCells } from '../placeGridCells';

const child = (id: string, overrides: Partial<TAutoLayoutChildSize> = {}): TAutoLayoutChildSize => ({
  height: 10,
  id,
  width: 10,
  ...overrides,
});

describe('placeGridCells', () => {
  it('should fill a row left to right and wrap to the next row', () => {
    const placements = placeGridCells([child('a'), child('b'), child('c')], 2, true);

    expect(placements).toEqual([
      { columnSpan: 1, columnStart: 0, id: 'a', rowSpan: 1, rowStart: 0 },
      { columnSpan: 1, columnStart: 1, id: 'b', rowSpan: 1, rowStart: 0 },
      { columnSpan: 1, columnStart: 0, id: 'c', rowSpan: 1, rowStart: 1 },
    ]);
  });

  it('should treat a missing, sub-one, or oversized span as clamped into range', () => {
    const placements = placeGridCells(
      [child('a', { gridColumnSpan: 0 }), child('b', { gridColumnSpan: 9 }), child('c', { gridRowSpan: -3 })],
      3,
      true,
    );

    expect(placements[0]).toMatchObject({ columnSpan: 1, columnStart: 0, rowStart: 0 });
    expect(placements[1]).toMatchObject({ columnSpan: 3, columnStart: 0, rowStart: 1 });
    expect(placements[2]).toMatchObject({ columnSpan: 1, rowSpan: 1, rowStart: 2 });
  });

  it('should push a wide child to the next row when it does not fit the remaining columns', () => {
    const placements = placeGridCells([child('a', { gridColumnSpan: 2 }), child('b', { gridColumnSpan: 2 })], 3, true);

    expect(placements).toEqual([
      { columnSpan: 2, columnStart: 0, id: 'a', rowSpan: 1, rowStart: 0 },
      { columnSpan: 2, columnStart: 0, id: 'b', rowSpan: 1, rowStart: 1 },
    ]);
  });

  it('should reserve every cell of a multi-row child so the next child lands below it', () => {
    const placements = placeGridCells([child('a', { gridRowSpan: 2 }), child('b'), child('c')], 2, true);

    expect(placements).toEqual([
      { columnSpan: 1, columnStart: 0, id: 'a', rowSpan: 2, rowStart: 0 },
      { columnSpan: 1, columnStart: 1, id: 'b', rowSpan: 1, rowStart: 0 },
      { columnSpan: 1, columnStart: 1, id: 'c', rowSpan: 1, rowStart: 1 },
    ]);
  });

  it('should honour an explicit cell anchor when automatic positioning is off, leaving holes', () => {
    const placements = placeGridCells([child('a', { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 2 }), child('b')], 3, false);

    expect(placements[0]).toEqual({ columnSpan: 1, columnStart: 1, id: 'a', rowSpan: 1, rowStart: 2 });
    expect(placements[1]).toMatchObject({ columnStart: 0, rowStart: 0 });
  });

  it('should clamp an out-of-range anchor into the grid', () => {
    const placements = placeGridCells(
      [
        child('a', { gridColumnAnchorIndex: 9, gridColumnSpan: 2, gridRowAnchorIndex: 5 }),
        child('b', { gridColumnAnchorIndex: -4, gridRowAnchorIndex: -1 }),
      ],
      3,
      false,
    );

    expect(placements[0]).toMatchObject({ columnStart: 1, rowStart: 5 });
    expect(placements[1]).toMatchObject({ columnStart: 0, rowStart: 0 });
  });

  it('should ignore anchors when automatic positioning is on', () => {
    const placements = placeGridCells([child('a', { gridColumnAnchorIndex: 2, gridRowAnchorIndex: 2 })], 2, true);

    expect(placements[0]).toMatchObject({ columnStart: 0, rowStart: 0 });
  });

  it('should skip a cell already taken by an anchored child when auto-placing the rest', () => {
    const placements = placeGridCells([child('a', { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0 }), child('b')], 2, false);

    expect(placements[1]).toMatchObject({ columnStart: 1, rowStart: 0 });
  });
});
