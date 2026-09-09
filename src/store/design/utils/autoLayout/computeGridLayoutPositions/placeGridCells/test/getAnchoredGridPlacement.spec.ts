// types
import { TAutoLayoutChildSize } from '../../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// utils
import { getAnchoredGridPlacement } from '../getAnchoredGridPlacement';

const child = (overrides: Partial<TAutoLayoutChildSize> = {}): TAutoLayoutChildSize => ({
  height: 10,
  id: 'a',
  width: 10,
  ...overrides,
});

describe('getAnchoredGridPlacement behaviors', () => {
  it('should place the child at its rounded anchor indices', () => {
    // before
    const placement = getAnchoredGridPlacement(child({ gridColumnAnchorIndex: 1.4, gridRowAnchorIndex: 2 }), 4, 1, 1);

    // result
    expect(placement).toEqual({ columnSpan: 1, columnStart: 1, id: 'a', rowSpan: 1, rowStart: 2 });
  });

  it('should clamp a column anchor so the span stays inside the grid', () => {
    // before
    const placement = getAnchoredGridPlacement(child({ gridColumnAnchorIndex: 9, gridRowAnchorIndex: 0 }), 4, 2, 1);

    // result
    expect(placement.columnStart).toBe(2);
  });

  it('should clamp negative anchors to zero', () => {
    // before
    const placement = getAnchoredGridPlacement(child({ gridColumnAnchorIndex: -3, gridRowAnchorIndex: -1 }), 4, 1, 1);

    // result
    expect(placement).toMatchObject({ columnStart: 0, rowStart: 0 });
  });
});
