import { fireEvent, render, screen } from '@testing-library/react';

// components
import TextFieldWrapper from './TextFieldWrapper';

// types
import { TextFieldVariant } from '../enums';

describe('TextFieldWrapper snapshots', () => {
  it('should render the input with start and end adornments', () => {
    // before
    const { asFragment } = render(<TextFieldWrapper endAdornment={<span>%</span>} startAdornment={<span>#</span>} value="ffffff" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('TextFieldWrapper behaviors', () => {
  it('should select the whole value on click, then forward the click to a caller handler', () => {
    // mock
    const onClick = vi.fn();

    // before
    render(<TextFieldWrapper onClick={onClick} readOnly value="ffffff" />);
    const input = screen.getByDisplayValue('ffffff') as HTMLInputElement;
    const select = vi.spyOn(input, 'select');

    // action
    fireEvent.click(input);

    // result
    expect(select).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
  });

  it('should select on click even when no caller click handler is given', () => {
    // before
    render(<TextFieldWrapper readOnly value="ffffff" />);
    const input = screen.getByDisplayValue('ffffff') as HTMLInputElement;
    const select = vi.spyOn(input, 'select');

    // action
    fireEvent.click(input);

    // result
    expect(select).toHaveBeenCalled();
  });

  it('should blur the input on Enter and still forward the key event to a caller handler', () => {
    // mock
    const onKeyDown = vi.fn();

    // before
    render(<TextFieldWrapper onKeyDown={onKeyDown} readOnly value="ffffff" />);
    const input = screen.getByDisplayValue('ffffff') as HTMLInputElement;
    const blur = vi.spyOn(input, 'blur');

    // action
    fireEvent.keyDown(input, { key: 'Enter' });

    // result
    expect(blur).toHaveBeenCalled();
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('should not blur on a non-Enter key and needs no caller key handler', () => {
    // before
    render(<TextFieldWrapper readOnly value="ffffff" />);
    const input = screen.getByDisplayValue('ffffff') as HTMLInputElement;
    const blur = vi.spyOn(input, 'blur');

    // action
    fireEvent.keyDown(input, { key: 'a' });

    // result
    expect(blur).not.toHaveBeenCalled();
  });

  it('should disable the input and mark the wrapper disabled', () => {
    // before
    const { container } = render(<TextFieldWrapper disabled value="ffffff" />);

    // result
    expect(screen.getByDisplayValue('ffffff')).toBeDisabled();
    expect(container.querySelector('[class*="TextFieldWrapper--disabled"]')).not.toBeNull();
  });

  it('should apply the outlined variant class when asked', () => {
    // before
    const { container } = render(<TextFieldWrapper value="ffffff" variant={TextFieldVariant.outlined} />);

    // result
    expect(container.querySelector('[class*="TextFieldWrapper--outlined"]')).not.toBeNull();
  });

  it('should expose the e2e value on the wrapper and the input', () => {
    // before
    const { container } = render(<TextFieldWrapper e2eValue="color" value="ffffff" />);

    // result
    expect(container.querySelector('[data-test-text-field="color"]')).not.toBeNull();
    expect(container.querySelector('[data-test-text-field-input="color"]')).not.toBeNull();
  });
});
