import { render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// components
import ImageEditMoreDropdownItems from './ImageEditMoreDropdownItems';

describe('ImageEditMoreDropdownItems behaviors', () => {
  it('should list every extra image tool', () => {
    // before
    render(
      <PopoverPrimitive.Root open>
        <ImageEditMoreDropdownItems />
      </PopoverPrimitive.Root>,
    );

    // result
    expect(screen.getAllByText(/./).length).toBeGreaterThanOrEqual(3);
  });
});
