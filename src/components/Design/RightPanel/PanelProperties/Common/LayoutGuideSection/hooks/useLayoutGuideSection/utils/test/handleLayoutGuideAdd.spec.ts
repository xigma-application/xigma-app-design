// types
import { LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';
import { handleLayoutGuideAdd } from '../handleLayoutGuideAdd';

describe('handleLayoutGuideAdd', () => {
  it('should replace mixed guides with a new grid, append otherwise, and open the new row', () => {
    // mock
    const commit = vi.fn();
    const onPickerOpenChange = vi.fn();
    const existing = [createLayoutGuide(LayoutGuideType.columns)];

    // before
    handleLayoutGuideAdd(true, 0, commit, onPickerOpenChange);
    handleLayoutGuideAdd(false, 1, commit, onPickerOpenChange);

    // result
    expect(commit.mock.calls[0][0](existing).map(({ type }: TLayoutGuide) => type)).toEqual([LayoutGuideType.grid]);
    expect(commit.mock.calls[1][0](existing).map(({ type }: TLayoutGuide) => type)).toEqual([
      LayoutGuideType.columns,
      LayoutGuideType.grid,
    ]);
    expect(onPickerOpenChange).toHaveBeenLastCalledWith(1, true);
  });
});
