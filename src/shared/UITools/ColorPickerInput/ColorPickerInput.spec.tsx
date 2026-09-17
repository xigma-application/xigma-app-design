import { fireEvent, render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { Provider } from 'react-redux';

// components
import ColorPickerInput from './ColorPickerInput';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderColorPickerInput = (props: Partial<ComponentProps<typeof ColorPickerInput>> = {}): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
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
      </TooltipProvider>
    </Provider>,
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

  it('should not show a center dot on the swatch by default', () => {
    // before
    const { container } = renderColorPickerInput();

    // result
    expect(container.querySelector('[class*="Color__dot"]')).toBeNull();
  });

  it('should show a center dot on the swatch when isPattern is set, for a pattern fill with no source', () => {
    // before
    const { container } = renderColorPickerInput({ isPattern: true });

    // result
    expect(container.querySelector('[class*="Color__dot"]')).not.toBeNull();
  });

  it('should render a plain trigger button calling onTriggerClick instead of opening the picker, when given', () => {
    // mock
    const onTriggerClick = vi.fn();
    const onOpenChange = vi.fn();

    // before
    renderColorPickerInput({ onOpenChange, onTriggerClick, triggerAriaLabel: 'Background color' });

    // action
    fireEvent.click(screen.getByLabelText('Background color'));

    // result — the plain button fired the given callback directly, instead of opening the picker popover
    expect(onTriggerClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('should keep the alpha field’s "%" adornment visible while the field is focused', () => {
    // before
    const { container } = renderColorPickerInput();

    // result — opts into TextFieldWrapper's keepEndAdornmentOnFocus, instead of the "%" (and the
    // input's width along with it) disappearing for the duration of the focus
    expect(container.querySelector('[class*="TextFieldWrapper__endAdornment--keepOnFocus"]')).not.toBeNull();
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

  it('should forward initialOpen so the picker popover renders already open, without a trigger click', () => {
    // before
    renderColorPickerInput({ initialOpen: true, triggerAriaLabel: 'Background color' });

    // result
    expect(screen.getByText('Solid')).toBeInTheDocument();
  });

  it('should report when the picker popover opens', () => {
    // mock
    const onOpenChange = vi.fn();

    // before
    renderColorPickerInput({ onOpenChange, triggerAriaLabel: 'Background color' });

    // action
    fireEvent.click(screen.getByLabelText('Background color'));

    // result
    expect(onOpenChange).toHaveBeenCalledWith(true);
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

  it('should forward paintTypeRow to the underlying color picker', () => {
    // before
    renderColorPickerInput({ paintTypeRow: true, triggerAriaLabel: 'Background color' });

    // action
    fireEvent.click(screen.getByLabelText('Background color'));

    // result
    expect(screen.getByRole('button', { name: 'Solid' })).toBeInTheDocument();
  });

  it('should show hexDisplayValue instead of the raw hex, as a read-only field, when given', () => {
    // before
    renderColorPickerInput({ hex: '#abcdef', hexDisplayValue: 'Linear' });

    // result
    const input = screen.getByDisplayValue('Linear');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('readonly');
    expect(screen.queryByDisplayValue('abcdef')).not.toBeInTheDocument();
  });

  it('should open the picker by clicking the read-only hexDisplayValue field, not by editing it', () => {
    // mock
    const onOpenChange = vi.fn();

    // before
    renderColorPickerInput({ hexDisplayValue: 'Linear', onOpenChange, triggerAriaLabel: 'Background color' });

    // action
    fireEvent.click(screen.getByDisplayValue('Linear'));

    // result
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('should not attempt to commit hexDisplayValue as a hex color on blur', () => {
    // mock
    const onCommitHex = vi.fn();

    // before
    renderColorPickerInput({ hexDisplayValue: 'Linear', onCommitHex });

    // action
    fireEvent.blur(screen.getByDisplayValue('Linear'));

    // result
    expect(onCommitHex).not.toHaveBeenCalled();
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
