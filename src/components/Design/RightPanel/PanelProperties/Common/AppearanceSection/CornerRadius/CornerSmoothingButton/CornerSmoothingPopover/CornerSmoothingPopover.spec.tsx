import { fireEvent, render, screen } from '@testing-library/react';

// components
import CornerSmoothingPopover from './CornerSmoothingPopover';
import { TooltipProvider } from 'shared';

const renderPopover = (onClose: TFunc = vi.fn()): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <CornerSmoothingPopover onClose={onClose} />
    </TooltipProvider>,
  );

describe('CornerSmoothingPopover snapshots', () => {
  it('should render the header, slider, value field, and iOS preview', () => {
    // before
    const { asFragment } = renderPopover();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('CornerSmoothingPopover behaviors', () => {
  it('should render the header title and the iOS preview label', () => {
    // before
    renderPopover();

    // result
    expect(screen.getByText('Corner smoothing')).toBeInTheDocument();
    expect(screen.getByText('iOS')).toBeInTheDocument();
  });

  it('should call onClose when the header close button is clicked', () => {
    // mock
    const onClose = vi.fn();

    // before
    renderPopover(onClose);

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(onClose).toHaveBeenCalled();
  });

  it('should start at 0% and commit a typed value on blur', () => {
    // before
    renderPopover();

    const getInput = (): HTMLInputElement => screen.getByRole('textbox', { name: 'Corner smoothing value' }) as HTMLInputElement;

    expect(getInput().value).toBe('0%');

    // action — the input remounts (key={defaultValue}) once the value commits, so re-query it
    fireEvent.change(getInput(), { target: { value: '60' } });
    fireEvent.blur(getInput());

    // result
    expect(getInput().value).toBe('60%');
  });

  it('should clamp a typed value above 100 down to 100', () => {
    // before
    renderPopover();

    const getInput = (): HTMLInputElement => screen.getByRole('textbox', { name: 'Corner smoothing value' }) as HTMLInputElement;

    // action
    fireEvent.change(getInput(), { target: { value: '1000' } });
    fireEvent.blur(getInput());

    // result
    expect(getInput().value).toBe('100%');
  });
});
