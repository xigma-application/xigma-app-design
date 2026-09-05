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
    expect(screen.getByText('Frame').parentElement?.previousElementSibling).toHaveStyle({ opacity: '1' });
  });

  it('should replace the check slot with a reserved icon slot when withCheck is false', () => {
    // before
    render(
      <PopoverPrimitive.Root open>
        <PopoverItem label="Frame" selected withCheck={false} />
      </PopoverPrimitive.Root>,
    );

    // result — an empty icon slot takes the check span's place, so rows without an icon still align
    const iconSlot = screen.getByText('Frame').parentElement?.previousElementSibling;
    expect(iconSlot).not.toBeNull();
    expect(iconSlot?.querySelector('svg')).not.toBeInTheDocument();
  });

  it('should reserve iconSize width on the icon slot regardless of whether an icon is given', () => {
    // before
    render(
      <PopoverPrimitive.Root open>
        <PopoverItem iconSize={20} label="Frame" withCheck={false} />
      </PopoverPrimitive.Root>,
    );

    // result
    expect(screen.getByText('Frame').parentElement?.previousElementSibling).toHaveStyle({ width: '20px' });
  });

  it('should render the icon inside the icon slot when withCheck is false and an icon is given', () => {
    // before
    const { container } = render(
      <PopoverPrimitive.Root open>
        <PopoverItem icon="FrameTool" label="Frame" withCheck={false} />
      </PopoverPrimitive.Root>,
    );

    // result
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render a checkbox indicator instead of the check glyph when checkVariant is checkbox', () => {
    // before
    const { container } = render(
      <PopoverPrimitive.Root open>
        <PopoverItem checkVariant="checkbox" label="Show rulers" selected />
      </PopoverPrimitive.Root>,
    );

    // result
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Show rulers').parentElement?.previousElementSibling).not.toBeNull();
  });

  it('should cap the label and shortcut row at maxWidth when given', () => {
    // before
    render(
      <PopoverPrimitive.Root open>
        <PopoverItem label="iPhone 16 & 17 Pro Max" maxWidth={174} shortcut="440×956" />
      </PopoverPrimitive.Root>,
    );

    // result
    const row = screen.getByText('iPhone 16 & 17 Pro Max').parentElement as HTMLElement;

    expect(row).toHaveStyle({ maxWidth: '174px' });
  });

  it('should not set a max width on the label and shortcut row by default', () => {
    // before
    render(
      <PopoverPrimitive.Root open>
        <PopoverItem label="Frame" shortcut="F" />
      </PopoverPrimitive.Root>,
    );

    // result
    const row = screen.getByText('Frame').parentElement as HTMLElement;

    expect(row.style.maxWidth).toBe('');
  });
});
