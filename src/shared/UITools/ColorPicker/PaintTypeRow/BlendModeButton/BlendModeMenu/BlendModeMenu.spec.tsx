import { fireEvent, render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// components
import BlendModeMenu from './BlendModeMenu';

// types
import { BlendMode } from 'types/design/enums';

const renderBlendModeMenu = (
  value: BlendMode = BlendMode.normal,
  onSelect: TFunc<[BlendMode], TFunc> = () => vi.fn(),
  onPreview?: TFunc<[BlendMode | null]>,
): ReturnType<typeof render> =>
  render(
    <PopoverPrimitive.Root open>
      <BlendModeMenu onPreview={onPreview} onSelect={onSelect} value={value} />
    </PopoverPrimitive.Root>,
  );

describe('BlendModeMenu', () => {
  it('should render every blend mode option except Pass through', () => {
    // before
    renderBlendModeMenu();

    // result
    expect(screen.queryByText('Pass through')).not.toBeInTheDocument();

    ['Normal', 'Darken', 'Multiply', 'Plus darker', 'Color burn', 'Lighten', 'Screen', 'Luminosity'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should mark the given value as selected, and no other option', () => {
    // before
    renderBlendModeMenu(BlendMode.multiply);
    const selectedItem = screen.getByText('Multiply').closest('div')!.parentElement!;
    const otherItem = screen.getByText('Normal').closest('div')!.parentElement!;

    // result
    expect(selectedItem.querySelector('span[style*="opacity: 1"]')).not.toBeNull();
    expect(otherItem.querySelector('span[style*="opacity: 1"]')).toBeNull();
  });

  it('should call onSelect with the clicked blend mode', () => {
    // mock
    const onSelect = vi.fn(() => vi.fn());

    // before
    renderBlendModeMenu(BlendMode.normal, onSelect);

    // action
    fireEvent.click(screen.getByText('Screen'));

    // result
    expect(onSelect).toHaveBeenCalledWith(BlendMode.screen);
  });

  it('should report the hovered blend mode for preview, and null when the pointer leaves it', () => {
    // mock
    const onPreview = vi.fn();

    // before
    renderBlendModeMenu(BlendMode.normal, () => vi.fn(), onPreview);
    const option = screen.getByText('Screen');

    // action
    fireEvent.mouseEnter(option.closest('div')!.parentElement!);
    fireEvent.mouseLeave(option.closest('div')!.parentElement!);

    // result
    expect(onPreview).toHaveBeenNthCalledWith(1, BlendMode.screen);
    expect(onPreview).toHaveBeenNthCalledWith(2, null);
  });
});
