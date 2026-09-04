import { fireEvent, render, screen } from '@testing-library/react';

// components
import AlignmentArea from './AlignmentArea';
import { TooltipProvider } from 'shared';

// types
import { AlignmentLayout } from 'types/design/enums';

const renderAlignmentArea = (
  value: AlignmentLayout,
  isHorizontal = false,
  onClick = vi.fn(),
  isGapAutoVertical = false,
  isGapAutoHorizontal = false,
): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <AlignmentArea
        isGapAutoHorizontal={isGapAutoHorizontal}
        isGapAutoVertical={isGapAutoVertical}
        isHorizontal={isHorizontal}
        onClick={onClick}
        value={value}
      />
    </TooltipProvider>,
  );

describe('AlignmentArea snapshots', () => {
  it('should render the 9 alignment options for a vertical frame', () => {
    // before
    const { asFragment } = renderAlignmentArea(AlignmentLayout.topLeft, false);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the 9 alignment options for a horizontal frame', () => {
    // before
    const { asFragment } = renderAlignmentArea(AlignmentLayout.bottomCenter, true);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render a single indicator per option when gap is auto on a vertical frame', () => {
    // before
    const { asFragment } = renderAlignmentArea(AlignmentLayout.topLeft, false, vi.fn(), true, false);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render a single indicator per option when gap is auto on a horizontal frame', () => {
    // before
    const { asFragment } = renderAlignmentArea(AlignmentLayout.topLeft, true, vi.fn(), false, true);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('AlignmentArea behaviors', () => {
  it('should render one option per alignment value', () => {
    // before
    renderAlignmentArea(AlignmentLayout.topLeft);

    // result
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('should mark the current value as pressed', () => {
    // before
    renderAlignmentArea(AlignmentLayout.center);

    // result
    expect(screen.getByLabelText('Center')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Top left')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should call onClick with the clicked option value', () => {
    // mock
    const onClick = vi.fn();

    // before
    renderAlignmentArea(AlignmentLayout.topLeft, false, onClick);

    // action
    screen.getByLabelText('Bottom right').click();

    // result
    expect(onClick).toHaveBeenCalledWith(AlignmentLayout.bottomRight);
  });

  it('should mark the whole column (1,4,7) as pressed when isGapAutoVertical is true on a vertical frame', () => {
    // before
    renderAlignmentArea(AlignmentLayout.topLeft, false, vi.fn(), true, false);

    // result
    expect(screen.getByLabelText('Top left')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Left')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Bottom left')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Center')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should not mark the whole column as pressed on a vertical frame when only isGapAutoHorizontal is true', () => {
    // before
    renderAlignmentArea(AlignmentLayout.topLeft, false, vi.fn(), false, true);

    // result
    expect(screen.getByLabelText('Top left')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Left')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should highlight a different column (2,5,8) on hover than the one selected (1,4,7)', () => {
    // before
    renderAlignmentArea(AlignmentLayout.topLeft, false, vi.fn(), true, false);

    // action
    fireEvent.mouseEnter(screen.getByLabelText('Top center'));

    // result
    expect(screen.getByLabelText('Top center').querySelector('[class*="indicator--highlighted"]')).not.toBeNull();
    expect(screen.getByLabelText('Center').querySelector('[class*="indicator--highlighted"]')).not.toBeNull();
    expect(screen.getByLabelText('Bottom center').querySelector('[class*="indicator--highlighted"]')).not.toBeNull();
    expect(screen.getByLabelText('Top left').querySelector('[class*="indicator--highlighted"]')).toBeNull();

    // result — the selected column (1,4,7) stays pressed regardless of the hovered column
    expect(screen.getByLabelText('Top left')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Left')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Bottom left')).toHaveAttribute('aria-pressed', 'true');

    // action
    fireEvent.mouseLeave(screen.getByLabelText('Top center'));

    // result
    expect(screen.getByLabelText('Center').querySelector('[class*="indicator--highlighted"]')).toBeNull();
  });

  it('should mark the whole row (1,2,3) as pressed when isGapAutoHorizontal is true on a horizontal frame', () => {
    // before
    renderAlignmentArea(AlignmentLayout.topLeft, true, vi.fn(), false, true);

    // result
    expect(screen.getByLabelText('Top left')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Top center')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Top right')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Left')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should not mark the whole row as pressed on a horizontal frame when only isGapAutoVertical is true', () => {
    // before
    renderAlignmentArea(AlignmentLayout.topLeft, true, vi.fn(), true, false);

    // result
    expect(screen.getByLabelText('Top left')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Top center')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should highlight a different row (4,5,6) on hover than the one selected (1,2,3) on a horizontal frame', () => {
    // before
    renderAlignmentArea(AlignmentLayout.topLeft, true, vi.fn(), false, true);

    // action
    fireEvent.mouseEnter(screen.getByLabelText('Left'));

    // result
    expect(screen.getByLabelText('Left').querySelector('[class*="indicator--highlighted"]')).not.toBeNull();
    expect(screen.getByLabelText('Center').querySelector('[class*="indicator--highlighted"]')).not.toBeNull();
    expect(screen.getByLabelText('Right').querySelector('[class*="indicator--highlighted"]')).not.toBeNull();
    expect(screen.getByLabelText('Top left').querySelector('[class*="indicator--highlighted"]')).toBeNull();
  });
});
