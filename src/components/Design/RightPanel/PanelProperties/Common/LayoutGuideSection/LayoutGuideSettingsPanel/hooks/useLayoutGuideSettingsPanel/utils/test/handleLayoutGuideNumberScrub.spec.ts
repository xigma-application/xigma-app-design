// types
import { LayoutGuideType } from 'types/design/enums';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';
import { handleLayoutGuideNumberScrub } from '../handleLayoutGuideNumberScrub';

describe('handleLayoutGuideNumberScrub', () => {
  it('should commit the scrubbed value rounded to two decimals', () => {
    // Step 1: Prepare
    const guide = createLayoutGuide(LayoutGuideType.grid);
    const onChange = vi.fn();

    // Step 2: Scrub size
    handleLayoutGuideNumberScrub(24.456, 'size', 1, guide, onChange);

    // Step 3: Assert
    expect(onChange).toHaveBeenCalledWith({ ...guide, size: 24.46 });
  });

  it('should clamp to the field minimum', () => {
    // Step 1: Prepare
    const guide = createLayoutGuide(LayoutGuideType.grid);
    const onChange = vi.fn();

    // Step 2: Scrub below the minimum
    handleLayoutGuideNumberScrub(-5, 'size', 1, guide, onChange);

    // Step 3: Assert
    expect(onChange).toHaveBeenCalledWith({ ...guide, size: 1 });
  });
});
