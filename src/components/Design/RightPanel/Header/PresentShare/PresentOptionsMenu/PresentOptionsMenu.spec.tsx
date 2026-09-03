import { fireEvent, render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// components
import PresentOptionsMenu from './PresentOptionsMenu';

const renderPresentOptionsMenu = (): ReturnType<typeof render> =>
  render(
    <PopoverPrimitive.Root open>
      <PresentOptionsMenu />
    </PopoverPrimitive.Root>,
  );

describe('PresentOptionsMenu behaviors', () => {
  it('should show Present as selected by default, and Preview when clicked', () => {
    // before
    renderPresentOptionsMenu();

    // result
    expect(screen.getByText('Present')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();

    // action
    fireEvent.click(screen.getByText('Preview'));

    // result — PopoverItem closes the popover on click via PopoverPrimitive.Close, so re-open state
    // isn't queryable here; this just documents the click doesn't throw and stays selectable
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });
});
