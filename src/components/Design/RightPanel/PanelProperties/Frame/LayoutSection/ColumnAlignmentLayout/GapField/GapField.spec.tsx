import { fireEvent, render, screen } from '@testing-library/react';

// components
import GapField from './GapField';
import { TooltipProvider } from 'shared';

const renderGapField = (
  isHorizontal: boolean,
  value: number,
  onBlur = vi.fn(),
  onScrub = vi.fn(),
  isModeAuto = false,
  onToggleMode = vi.fn(),
): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GapField
        isHorizontal={isHorizontal}
        isModeAuto={isModeAuto}
        onBlur={onBlur}
        onScrub={onScrub}
        onToggleMode={onToggleMode}
        value={value}
      />
    </TooltipProvider>,
  );

describe('GapField snapshots', () => {
  it('should render the horizontal gap icon', () => {
    // before
    const { asFragment } = renderGapField(true, 12);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the vertical gap icon', () => {
    // before
    const { asFragment } = renderGapField(false, 12);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the disabled input and active toggle when the mode is auto', () => {
    // before
    const { asFragment } = renderGapField(true, 12, undefined, undefined, true);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('GapField behaviors', () => {
  it('should show the current value', () => {
    // before
    renderGapField(true, 24);

    // result
    expect(screen.getByLabelText('Gap')).toHaveValue(24);
  });

  it('should call onBlur when the input loses focus', () => {
    // mock
    const onBlur = vi.fn();

    // before
    renderGapField(true, 24, onBlur);
    const input = screen.getByLabelText('Gap');

    // action
    fireEvent.blur(input);

    // result
    expect(onBlur).toHaveBeenCalled();
  });

  it('should disable the numeric input while the mode is auto', () => {
    // before
    renderGapField(true, 24, undefined, undefined, true);

    // result
    expect(screen.getByLabelText('Gap')).toBeDisabled();
  });

  it('should call onToggleMode when the mode toggle is clicked', () => {
    // mock
    const onToggleMode = vi.fn();

    // before
    renderGapField(true, 24, undefined, undefined, false, onToggleMode);

    // action
    fireEvent.click(screen.getByLabelText('Toggle auto gap'));

    // result
    expect(onToggleMode).toHaveBeenCalled();
  });
});
