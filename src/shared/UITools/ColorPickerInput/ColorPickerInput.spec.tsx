import { fireEvent, render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';

// components
import ColorPickerInput from './ColorPickerInput';
import { TooltipProvider } from 'shared';

const renderColorPickerInput = (props: Partial<ComponentProps<typeof ColorPickerInput>> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ColorPickerInput
        alpha={100}
        e2eValue="background"
        hex="#444444"
        onCommitAlpha={vi.fn()}
        onCommitHex={vi.fn()}
        onPickerChange={vi.fn()}
        {...props}
      />
    </TooltipProvider>,
  );

describe('ColorPickerInput snapshots', () => {
  it('should render the swatch trigger, the hex field, and the alpha field', () => {
    // before
    const { asFragment } = renderColorPickerInput();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColorPickerInput behaviors', () => {
  it('should seed the hex input without the leading hash and the alpha input rounded', () => {
    // before
    renderColorPickerInput({ alpha: 37.6, hex: '#abcdef' });

    // result
    expect(screen.getByDisplayValue('abcdef')).toBeInTheDocument();
    expect(screen.getByDisplayValue('38')).toBeInTheDocument();
  });

  it('should commit a normalised hex on blur when the typed value is valid', () => {
    // mock
    const onCommitHex = vi.fn();

    // before
    renderColorPickerInput({ onCommitHex });
    const input = screen.getByDisplayValue('444444');

    // action
    fireEvent.change(input, { target: { value: 'abcdef' } });
    fireEvent.blur(input);

    // result
    expect(onCommitHex).toHaveBeenCalledWith('#abcdef');
  });

  it('should commit a clamped alpha on blur', () => {
    // mock
    const onCommitAlpha = vi.fn();

    // before
    renderColorPickerInput({ onCommitAlpha });
    const input = screen.getByDisplayValue('100');

    // action
    fireEvent.change(input, { target: { value: '150' } });
    fireEvent.blur(input);

    // result
    expect(onCommitAlpha).toHaveBeenCalledWith(100);
  });

  it('should label the swatch trigger with the given aria-label', () => {
    // before
    renderColorPickerInput({ triggerAriaLabel: 'Background color' });

    // result
    expect(screen.getByLabelText('Background color')).toBeInTheDocument();
  });

  it('should render the percent unit', () => {
    // before
    renderColorPickerInput();

    // result
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('should expose the e2e value on both fields', () => {
    // before
    const { container } = renderColorPickerInput({ e2eValue: 'background' });

    // result
    expect(container.querySelector('[data-test-text-field-input="background-color"]')).not.toBeNull();
    expect(container.querySelector('[data-test-text-field-input="background-alpha"]')).not.toBeNull();
  });

  it('should not render a visibility toggle when onToggleVisibility is not given', () => {
    // before
    renderColorPickerInput();

    // result
    expect(screen.queryByRole('button', { name: /visibility/i })).not.toBeInTheDocument();
  });

  it('should render a visibility toggle that calls onToggleVisibility when clicked', () => {
    // mock
    const onToggleVisibility = vi.fn();

    // before
    renderColorPickerInput({ onToggleVisibility, toggleVisibilityAriaLabel: 'Toggle background visibility' });

    // action
    fireEvent.click(screen.getByLabelText('Toggle background visibility'));

    // result
    expect(onToggleVisibility).toHaveBeenCalled();
  });

  it('should render the hidden-state icon when isVisible is false', () => {
    // before
    renderColorPickerInput({
      isVisible: false,
      onToggleVisibility: vi.fn(),
      toggleVisibilityAriaLabel: 'Toggle background visibility',
    });

    // result
    expect(screen.getByLabelText('Toggle background visibility')).toBeInTheDocument();
  });

  it('should report onDragStart/onDragEnd around a drag on the alpha scrubber', () => {
    // mock
    const onDragEnd = vi.fn();
    const onDragStart = vi.fn();

    // before
    const { container } = renderColorPickerInput({ onDragEnd, onDragStart });
    const scrubber = container.querySelector('[class*="ScrubbableInput"]') as HTMLDivElement;

    // action
    fireEvent.mouseDown(scrubber, { clientX: 0, clientY: 0 });
    fireEvent.mouseUp(scrubber, { clientX: 0, clientY: 0 });

    // result
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
