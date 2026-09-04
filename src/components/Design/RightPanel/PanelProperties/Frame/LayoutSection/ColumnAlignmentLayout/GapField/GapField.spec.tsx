import { fireEvent, render, screen } from '@testing-library/react';

// components
import GapField from './GapField';
import { TooltipProvider } from 'shared';

const renderGapField = (isHorizontal: boolean, value: number, onBlur = vi.fn(), onScrub = vi.fn()): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GapField isHorizontal={isHorizontal} onBlur={onBlur} onScrub={onScrub} value={value} />
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
});
