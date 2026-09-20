import { FocusEvent } from 'react';

// types
import { LayoutGuideType } from 'types/design/enums';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';
import { handleLayoutGuideNumberBlur } from '../handleLayoutGuideNumberBlur';

const createEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('handleLayoutGuideNumberBlur', () => {
  it('should commit a changed number and normalize the input', () => {
    // Step 1: Prepare
    const guide = createLayoutGuide(LayoutGuideType.grid);
    const onChange = vi.fn();
    const event = createEvent(' 24.256 ');

    // Step 2: Blur with a new value
    handleLayoutGuideNumberBlur(event, 'size', 1, guide, onChange);

    // Step 3: Assert
    expect(onChange).toHaveBeenCalledWith({ ...guide, size: 24.26 });
    expect(event.target.value).toBe('24.26');
  });

  it('should clamp to the field minimum', () => {
    // Step 1: Prepare
    const guide = createLayoutGuide(LayoutGuideType.grid);
    const onChange = vi.fn();

    // Step 2: Blur with a value below the minimum
    handleLayoutGuideNumberBlur(createEvent('-3'), 'size', 1, guide, onChange);

    // Step 3: Assert
    expect(onChange).toHaveBeenCalledWith({ ...guide, size: 1 });
  });

  it('should not commit an unchanged value and should restore the input on invalid text', () => {
    // Step 1: Prepare
    const guide = createLayoutGuide(LayoutGuideType.grid);
    const onChange = vi.fn();
    const invalid = createEvent('abc');

    // Step 2: Blur unchanged then invalid
    handleLayoutGuideNumberBlur(createEvent('10'), 'size', 1, guide, onChange);
    handleLayoutGuideNumberBlur(invalid, 'size', 1, guide, onChange);

    // Step 3: Assert
    expect(onChange).not.toHaveBeenCalled();
    expect(invalid.target.value).toBe('10');
  });

  it('should append the unit suffix to the normalized input', () => {
    // Step 1: Prepare
    const guide = createLayoutGuide(LayoutGuideType.grid);
    const onChange = vi.fn();
    const event = createEvent('24');

    // Step 2: Blur with a unit
    handleLayoutGuideNumberBlur(event, 'size', 1, guide, onChange, 'px');

    // Step 3: Assert
    expect(event.target.value).toBe('24px');
  });
});
