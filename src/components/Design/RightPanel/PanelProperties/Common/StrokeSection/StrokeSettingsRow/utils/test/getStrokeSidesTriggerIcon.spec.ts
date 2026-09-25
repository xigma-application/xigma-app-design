// types
import { StrokeSides } from 'types/design/enums';

// utils
import { getStrokeSidesTriggerIcon } from '../getStrokeSidesTriggerIcon';

describe('getStrokeSidesTriggerIcon', () => {
  it('should show the all-sides icon for custom sides', () => {
    // result
    expect(getStrokeSidesTriggerIcon(StrokeSides.custom)).toBe('Stroke');
  });

  it('should show the side icon otherwise', () => {
    // result
    expect(getStrokeSidesTriggerIcon(StrokeSides.left)).toBe('StrokeLeft');
  });
});
