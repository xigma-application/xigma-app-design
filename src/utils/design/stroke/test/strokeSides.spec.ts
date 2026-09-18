// types
import { NodeType, StrokeAlign, StrokeSides } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getPaddedRect } from '../getPaddedRect';
import { getStrokePaddings } from '../getStrokePaddings';
import { getStrokeSideWidthChange } from '../getStrokeSideWidthChange';
import { getStrokeSideWidths } from '../getStrokeSideWidths';
import { getStrokeSidesChange } from '../getStrokeSidesChange';
import { getStrokeWeightChange } from '../getStrokeWeightChange';
import { getStrokeWeightDisplay } from '../getStrokeWeightDisplay';

const buildRect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
  height: 50,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  strokeAlign: StrokeAlign.outside,
  strokeWidth: 4,
  strokes: [{ color: '#000', opacity: 100, type: 'solid' }],
  type: NodeType.rectangle,
  width: 100,
  x: 10,
  y: 20,
  ...overrides,
});

describe('getStrokeSideWidths', () => {
  it('should use the weight for every side by default', () => {
    expect(getStrokeSideWidths({ strokeWidth: 4 })).toEqual({ bottom: 4, left: 4, right: 4, top: 4 });
  });

  it('should keep only the chosen side for a single side mode', () => {
    expect(getStrokeSideWidths({ strokeSides: StrokeSides.top, strokeWidth: 4 })).toEqual({ bottom: 0, left: 0, right: 0, top: 4 });
  });

  it('should read the four widths in custom mode', () => {
    const widths = getStrokeSideWidths({
      strokeBottomWidth: 4,
      strokeLeftWidth: 1,
      strokeRightWidth: 3,
      strokeSides: StrokeSides.custom,
      strokeTopWidth: 2,
    });

    expect(widths).toEqual({ bottom: 4, left: 1, right: 3, top: 2 });
  });
});

describe('getStrokeWeightDisplay', () => {
  it('should be the weight outside custom mode', () => {
    expect(getStrokeWeightDisplay({ strokeSides: StrokeSides.top, strokeWidth: 4 })).toBe(4);
  });

  it('should be the shared value in custom mode when every side matches', () => {
    const node = { strokeBottomWidth: 3, strokeLeftWidth: 3, strokeRightWidth: 3, strokeSides: StrokeSides.custom, strokeTopWidth: 3 };

    expect(getStrokeWeightDisplay(node)).toBe(3);
  });

  it('should be null (mixed) in custom mode when sides differ', () => {
    const node = { strokeBottomWidth: 3, strokeLeftWidth: 5, strokeRightWidth: 3, strokeSides: StrokeSides.custom, strokeTopWidth: 3 };

    expect(getStrokeWeightDisplay(node)).toBeNull();
  });
});

describe('getStrokeSidesChange', () => {
  it('should keep the weight and zero the other sides when switching to a single side', () => {
    expect(getStrokeSidesChange({ strokeWidth: 4 }, StrokeSides.top)).toMatchObject({ strokeSides: StrokeSides.top, strokeWidth: 4 });
  });

  it('should seed the four widths from the current ones when switching to custom', () => {
    expect(getStrokeSidesChange({ strokeSides: StrokeSides.left, strokeWidth: 4 }, StrokeSides.custom)).toEqual({
      strokeBottomWidth: 0,
      strokeLeftWidth: 4,
      strokeRightWidth: 0,
      strokeSides: StrokeSides.custom,
      strokeTopWidth: 0,
      strokeWidth: 4,
    });
  });

  it('should take the largest side when switching back to all from mixed sides', () => {
    const node = { strokeBottomWidth: 3, strokeLeftWidth: 9, strokeRightWidth: 1, strokeSides: StrokeSides.custom, strokeTopWidth: 2 };

    expect(getStrokeSidesChange(node, StrokeSides.all)).toMatchObject({ strokeSides: StrokeSides.all, strokeWidth: 9 });
  });

  it('should keep that side own width when moving from custom to a single side', () => {
    const node = { strokeBottomWidth: 3, strokeLeftWidth: 9, strokeRightWidth: 1, strokeSides: StrokeSides.custom, strokeTopWidth: 2 };

    expect(getStrokeSidesChange(node, StrokeSides.bottom)).toMatchObject({ strokeSides: StrokeSides.bottom, strokeWidth: 3 });
  });
});

describe('getStrokeWeightChange', () => {
  it('should only change the weight outside custom mode', () => {
    expect(getStrokeWeightChange({ strokeWidth: 4 }, 7)).toEqual({ strokeWidth: 7 });
  });

  it('should set all four sides in custom mode', () => {
    expect(getStrokeWeightChange({ strokeSides: StrokeSides.custom, strokeWidth: 4 }, 7)).toEqual({
      strokeBottomWidth: 7,
      strokeLeftWidth: 7,
      strokeRightWidth: 7,
      strokeTopWidth: 7,
      strokeWidth: 7,
    });
  });
});

describe('getStrokeSideWidthChange', () => {
  it('should set one side and keep the weight at the widest side', () => {
    const node = { strokeBottomWidth: 3, strokeLeftWidth: 1, strokeRightWidth: 1, strokeSides: StrokeSides.custom, strokeTopWidth: 2 };

    expect(getStrokeSideWidthChange(node, 'left', 8)).toEqual({ strokeLeftWidth: 8, strokeWidth: 8 });
  });
});

describe('getStrokePaddings', () => {
  it('should pad every side for an outside stroke', () => {
    expect(getStrokePaddings(buildRect())).toEqual({ bottom: 4, left: 4, right: 4, top: 4 });
  });

  it('should pad only the top for a top-only outside stroke', () => {
    expect(getStrokePaddings(buildRect({ strokeSides: StrokeSides.top }))).toEqual({ bottom: 0, left: 0, right: 0, top: 4 });
  });

  it('should pad half the width for a center stroke', () => {
    expect(getStrokePaddings(buildRect({ strokeAlign: StrokeAlign.center, strokeSides: StrokeSides.left }))).toEqual({
      bottom: 0,
      left: 2,
      right: 0,
      top: 0,
    });
  });

  it('should not pad an inside stroke', () => {
    expect(getStrokePaddings(buildRect({ strokeAlign: StrokeAlign.inside }))).toEqual({ bottom: 0, left: 0, right: 0, top: 0 });
  });
});

describe('getPaddedRect', () => {
  it('should grow the rect by the per-side paddings', () => {
    expect(getPaddedRect({ height: 50, width: 100, x: 10, y: 20 }, { bottom: 4, left: 1, right: 2, top: 3 })).toEqual({
      height: 57,
      width: 103,
      x: 9,
      y: 17,
    });
  });
});
