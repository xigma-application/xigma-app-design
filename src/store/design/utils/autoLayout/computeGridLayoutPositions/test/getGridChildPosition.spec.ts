// types
import { AlignmentHorizontal, AlignmentVertical, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// utils
import { getGridChildPosition } from '../getGridChildPosition';

const CELL = { height: 100, width: 200, x: 50, y: 30 };

const child = (overrides: Partial<TAutoLayoutChildSize> = {}): TAutoLayoutChildSize => ({
  height: 40,
  id: 'a',
  width: 60,
  ...overrides,
});

describe('getGridChildPosition', () => {
  it('should place an intrinsically-sized child at the top-left of its cell by default', () => {
    expect(getGridChildPosition(child(), CELL)).toEqual({ height: 40, id: 'a', width: 60, x: 50, y: 30 });
  });

  it('should centre the child in its cell', () => {
    const position = getGridChildPosition(
      child({ gridChildHorizontalAlign: AlignmentHorizontal.center, gridChildVerticalAlign: AlignmentVertical.center }),
      CELL,
    );

    expect(position).toEqual({ height: 40, id: 'a', width: 60, x: 120, y: 60 });
  });

  it('should align the child to the far edge of its cell', () => {
    const position = getGridChildPosition(
      child({ gridChildHorizontalAlign: AlignmentHorizontal.right, gridChildVerticalAlign: AlignmentVertical.bottom }),
      CELL,
    );

    expect(position).toEqual({ height: 40, id: 'a', width: 60, x: 190, y: 90 });
  });

  it('should stretch a fill child to the cell and pin it to the cell origin', () => {
    const position = getGridChildPosition(child({ heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill }), CELL);

    expect(position).toEqual({ height: 100, id: 'a', width: 200, x: 50, y: 30 });
  });

  it('should clamp a stretched fill child to its max on one axis and its min on the other', () => {
    const position = getGridChildPosition(
      child({
        heightSizingMode: SizingMode.fill,
        maxWidth: 120,
        minHeight: 140,
        widthSizingMode: SizingMode.fill,
      }),
      CELL,
    );

    expect(position).toEqual({ height: 140, id: 'a', width: 120, x: 50, y: 30 });
  });
});
