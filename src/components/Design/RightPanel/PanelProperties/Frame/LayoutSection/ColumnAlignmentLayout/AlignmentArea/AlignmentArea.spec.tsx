import { render, screen } from '@testing-library/react';

// components
import AlignmentArea from './AlignmentArea';
import { TooltipProvider } from 'shared';

// types
import { AlignmentLayout } from 'types/design/enums';

const renderAlignmentArea = (value: AlignmentLayout, isHorizontal = false, onClick = vi.fn()): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <AlignmentArea isHorizontal={isHorizontal} onClick={onClick} value={value} />
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
});
