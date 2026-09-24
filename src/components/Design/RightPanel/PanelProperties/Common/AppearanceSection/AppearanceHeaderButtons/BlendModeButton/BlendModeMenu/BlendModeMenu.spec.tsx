import { fireEvent, render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC } from 'react';

// components
import BlendModeMenu from './BlendModeMenu';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// types
import { BlendMode } from 'types/design/enums';
import { TBlendModePreview } from 'types/design/canvas/types';

let capturedPreviewRef: { current: TBlendModePreview | null } | null = null;

const RefsProbe: FC = () => {
  capturedPreviewRef = useCanvasRefsContext().blendMode.previewRef;

  return null;
};

const renderBlendModeMenu = (
  value: BlendMode = BlendMode.passThrough,
  onSelect: TFunc<[BlendMode], TFunc> = () => vi.fn(),
): ReturnType<typeof render> =>
  render(
    <CanvasRefsProvider>
      <RefsProbe />
      <PopoverPrimitive.Root open>
        <BlendModeMenu nodeIds={['node-1']} onSelect={onSelect} value={value} />
      </PopoverPrimitive.Root>
    </CanvasRefsProvider>,
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

  it('should mark the given value as selected, and no other option', () => {
    // before
    renderBlendModeMenu(BlendMode.multiply);
    const selectedItem = screen.getByText('Multiply').closest('div')!.parentElement!;
    const otherItem = screen.getByText('Normal').closest('div')!.parentElement!;

    // result — PopoverItem renders a Check icon with opacity 1 when selected, 0 otherwise
    expect(selectedItem.querySelector('span[style*="opacity: 1"]')).not.toBeNull();
    expect(otherItem.querySelector('span[style*="opacity: 1"]')).toBeNull();
  });

  it('should call onSelect with the clicked blend mode', () => {
    // mock
    const onSelect = vi.fn(() => vi.fn());

    // before
    renderBlendModeMenu(BlendMode.passThrough, onSelect);

    // action
    fireEvent.click(screen.getByText('Screen'));

    // result
    expect(onSelect).toHaveBeenCalledWith(BlendMode.screen);
  });

  it('should preview the hovered blend mode for the given node without changing the actual value', () => {
    // before
    renderBlendModeMenu();

    // action — the hover wrapper sits one level above PopoverItem's own root div
    fireEvent.mouseEnter(screen.getByText('Multiply').closest('div')!.parentElement!.parentElement!);

    // result
    expect(capturedPreviewRef?.current).toEqual({ blendMode: BlendMode.multiply, nodeIds: ['node-1'] });
  });

  it('should clear the preview when the pointer leaves the option', () => {
    // before
    renderBlendModeMenu();
    const row = screen.getByText('Multiply').closest('div')!.parentElement!.parentElement!;

    fireEvent.mouseEnter(row);

    // action
    fireEvent.mouseLeave(row);

    // result
    expect(capturedPreviewRef?.current).toBeNull();
  });
});
