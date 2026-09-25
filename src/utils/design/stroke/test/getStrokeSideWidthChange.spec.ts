// types
import { StrokeSides } from 'types/design/enums';

// utils
import { getStrokeSideWidthChange } from '../getStrokeSideWidthChange';

describe('getStrokeSideWidthChange', () => {
  it('should set the side width and keep the stroke width at the widest side', () => {
    // mock
    const node = { strokeLeftWidth: 2, strokeSides: StrokeSides.custom, strokeTopWidth: 6, strokeWidth: 6 };

    // result
    expect(getStrokeSideWidthChange(node, 'bottom', 4)).toEqual({ strokeBottomWidth: 4, strokeWidth: 6 });
    expect(getStrokeSideWidthChange(node, 'top', 1)).toEqual({ strokeTopWidth: 1, strokeWidth: 2 });
  });
});
