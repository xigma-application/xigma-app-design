import { fireEvent, render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// components
import FaceBlendModeMenu from './FaceBlendModeMenu';

// types
import { BlendMode } from 'types/design/enums';

const renderFaceBlendModeMenu = (
  value: BlendMode = BlendMode.normal,
  onSelect: TFunc<[BlendMode], TFunc> = () => vi.fn(),
): ReturnType<typeof render> =>
  render(
    <PopoverPrimitive.Root open>
      <FaceBlendModeMenu onSelect={onSelect} value={value} />
    </PopoverPrimitive.Root>,
  );

describe('FaceBlendModeMenu', () => {
  it('should render every blend mode option except Pass through', () => {
    // before
    renderFaceBlendModeMenu();

    // result
    expect(screen.queryByText('Pass through')).not.toBeInTheDocument();

    ['Normal', 'Darken', 'Multiply', 'Plus darker', 'Color burn', 'Lighten', 'Screen', 'Luminosity'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should mark the given value as selected, and no other option', () => {
    // before
    renderFaceBlendModeMenu(BlendMode.multiply);
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
    renderFaceBlendModeMenu(BlendMode.normal, onSelect);

    // action
    fireEvent.click(screen.getByText('Screen'));

    // result
    expect(onSelect).toHaveBeenCalledWith(BlendMode.screen);
  });
});
