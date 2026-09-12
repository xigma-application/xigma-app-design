import { fireEvent, render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// components
import BlendModeMenu from './BlendModeMenu';

const renderBlendModeMenu = (): ReturnType<typeof render> =>
  render(
    <PopoverPrimitive.Root open>
      <BlendModeMenu />
    </PopoverPrimitive.Root>,
  );

describe('BlendModeMenu snapshots', () => {
  it('should render every blend mode option grouped with separators', () => {
    // before
    const { asFragment } = renderBlendModeMenu();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('BlendModeMenu behaviors', () => {
  it('should render every blend mode option', () => {
    // before
    renderBlendModeMenu();

    // result
    [
      'Pass through',
      'Normal',
      'Darken',
      'Multiply',
      'Plus darker',
      'Color burn',
      'Lighten',
      'Screen',
      'Plus lighter',
      'Color dodge',
      'Overlay',
      'Soft light',
      'Hard light',
      'Difference',
      'Exclusion',
      'Hue',
      'Saturation',
      'Color',
      'Luminosity',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should mark Pass through as selected by default, and no other option', () => {
    // before
    renderBlendModeMenu();
    const selectedItem = screen.getByText('Pass through').closest('div')!.parentElement!;
    const otherItem = screen.getByText('Normal').closest('div')!.parentElement!;

    // result — PopoverItem renders a Check icon with opacity 1 when selected, 0 otherwise
    expect(selectedItem.querySelector('span[style*="opacity: 1"]')).not.toBeNull();
    expect(otherItem.querySelector('span[style*="opacity: 1"]')).toBeNull();
  });

  it('should move the selection to the clicked option', () => {
    // before
    renderBlendModeMenu();

    // action
    fireEvent.click(screen.getByText('Multiply'));

    // result
    const selectedItem = screen.getByText('Multiply').closest('div')!.parentElement!;

    expect(selectedItem.querySelector('span[style*="opacity: 1"]')).not.toBeNull();
  });
});
