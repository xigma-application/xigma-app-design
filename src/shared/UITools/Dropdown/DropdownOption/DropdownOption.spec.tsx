import * as PopoverPrimitive from '@radix-ui/react-popover';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import DropdownOption from './DropdownOption';

const renderDropdownOption = (
  onClick: TFunc,
  selected: boolean,
  highlighted = false,
  onMouseEnter: TFunc = vi.fn(),
): ReturnType<typeof render> =>
  render(
    <PopoverPrimitive.Root open>
      <DropdownOption highlighted={highlighted} label="Hex" onClick={onClick} onMouseEnter={onMouseEnter} selected={selected} />
    </PopoverPrimitive.Root>,
  );

describe('DropdownOption snapshots', () => {
  it('should render DropdownOption unselected', () => {
    // before
    const { asFragment } = renderDropdownOption(vi.fn(), false);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render DropdownOption selected', () => {
    // before
    const { asFragment } = renderDropdownOption(vi.fn(), true);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render DropdownOption highlighted', () => {
    // before
    const { asFragment } = renderDropdownOption(vi.fn(), false, true);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('DropdownOption behaviors', () => {
  it('should call onClick when clicked', () => {
    // mock
    const onClick = vi.fn();

    // before
    renderDropdownOption(onClick, false);

    // action
    fireEvent.click(screen.getByText('Hex'));

    // result
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should call onMouseEnter when hovered', () => {
    // mock
    const onMouseEnter = vi.fn();

    // before
    renderDropdownOption(vi.fn(), false, false, onMouseEnter);

    // action
    fireEvent.mouseEnter(screen.getByText('Hex'));

    // result
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });
});
