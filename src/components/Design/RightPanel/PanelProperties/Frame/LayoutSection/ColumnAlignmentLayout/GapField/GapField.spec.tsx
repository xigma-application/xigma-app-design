import { fireEvent, render, screen } from '@testing-library/react';

// components
import GapField from './GapField';
import { TooltipProvider } from 'shared';

// types
import { GapMode } from 'types/design/enums';

const renderGapField = (overrides: Partial<Parameters<typeof GapField>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GapField
        isHorizontal
        mode={GapMode.fixed}
        onCommit={vi.fn()}
        onSelectAuto={vi.fn()}
        onSelectFixed={vi.fn()}
        value={12}
        {...overrides}
      />
    </TooltipProvider>,
  );

describe('GapField snapshots', () => {
  it('should render the horizontal gap icon', () => {
    // before
    const { asFragment } = renderGapField({ isHorizontal: true });

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the vertical gap icon', () => {
    // before
    const { asFragment } = renderGapField({ isHorizontal: false });

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the literal "Auto" text as the input value when the mode is auto', () => {
    // before
    const { asFragment } = renderGapField({ mode: GapMode.auto, value: 320 });

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('GapField behaviors', () => {
  it('should show the current numeric value while fixed', () => {
    // before
    renderGapField({ value: 24 });

    // result
    expect(screen.getByLabelText('Gap')).toHaveValue(24);
  });

  it('should show the literal "Auto" text as the value while auto', () => {
    // before
    renderGapField({ mode: GapMode.auto, value: 320 });

    // result
    expect(screen.getByLabelText('Gap')).toHaveValue('Auto');
  });

  it('should never disable the numeric input, fixed or auto', () => {
    // before
    renderGapField({ mode: GapMode.auto });

    // result
    expect(screen.getByLabelText('Gap')).not.toBeDisabled();
  });

  it('should call onCommit with the typed number when a valid value is entered and the input loses focus', () => {
    // mock
    const onCommit = vi.fn();

    // before
    renderGapField({ mode: GapMode.auto, onCommit, value: 320 });
    const input = screen.getByLabelText('Gap');

    // action — overwrite the "Auto" text with a real number
    fireEvent.change(input, { target: { value: '18' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).toHaveBeenCalledWith(18);
  });

  it('should revert to the literal "Auto" text when garbage is entered while auto', () => {
    // mock
    const onCommit = vi.fn();

    // before
    renderGapField({ mode: GapMode.auto, onCommit, value: 320 });
    const input = screen.getByLabelText('Gap');

    // action
    fireEvent.change(input, { target: { value: 'nonsense' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input).toHaveValue('Auto');
  });

  it('should revert to the current numeric value when garbage is entered while fixed', () => {
    // mock
    const onCommit = vi.fn();

    // before
    renderGapField({ mode: GapMode.fixed, onCommit, value: 24 });
    const input = screen.getByLabelText('Gap');

    // action
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input).toHaveValue(24);
  });

  it('should always show the chevron menu trigger, fixed or auto', () => {
    // before
    const { rerender } = renderGapField({ mode: GapMode.fixed });

    // result
    expect(screen.getByLabelText('Horizontal gap options')).toBeInTheDocument();

    // action
    rerender(
      <TooltipProvider>
        <GapField isHorizontal mode={GapMode.auto} onCommit={vi.fn()} onSelectAuto={vi.fn()} onSelectFixed={vi.fn()} value={320} />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByLabelText('Horizontal gap options')).toBeInTheDocument();
  });

  it('should use the vertical aria label for a vertical field', () => {
    // before
    renderGapField({ isHorizontal: false, mode: GapMode.fixed });

    // result
    expect(screen.getByLabelText('Vertical gap options')).toBeInTheDocument();
  });
});
