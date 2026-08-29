import * as PopoverPrimitive from '@radix-ui/react-popover';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import PopoverItem from './PopoverItem';

describe('PopoverItem snapshots', () => {
  it('should render PopoverItem', () => {
    // before
    const { asFragment } = render(
      <PopoverPrimitive.Root open>
        <PopoverItem icon="FrameTool" label="Frame" selected shortcut="F" />
      </PopoverPrimitive.Root>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render a disabled PopoverItem', () => {
    // before
    const { asFragment } = render(
      <PopoverPrimitive.Root open>
        <PopoverItem disabled icon="FrameTool" label="Frame" shortcut="F" />
      </PopoverPrimitive.Root>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PopoverItem behaviors', () => {
  it('should call onClick when clicked', () => {
    // mock
    const onClick = vi.fn();

    // before
    render(
      <PopoverPrimitive.Root open>
        <PopoverItem label="Frame" onClick={onClick} />
      </PopoverPrimitive.Root>,
    );

    // action
    fireEvent.click(screen.getByText('Frame'));

    // result
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should reserve the check slot by default', () => {
    // before
    render(
      <PopoverPrimitive.Root open>
        <PopoverItem label="Frame" selected />
      </PopoverPrimitive.Root>,
    );

    // result
    expect(screen.getByText('Frame').previousElementSibling).toHaveStyle({ opacity: '1' });
  });

  it('should drop the check slot when withCheck is false', () => {
    // before
    render(
      <PopoverPrimitive.Root open>
        <PopoverItem label="Frame" selected withCheck={false} />
      </PopoverPrimitive.Root>,
    );

    // result — the label is the first child, no check span before it
    expect(screen.getByText('Frame').previousElementSibling).toBeNull();
  });
});
