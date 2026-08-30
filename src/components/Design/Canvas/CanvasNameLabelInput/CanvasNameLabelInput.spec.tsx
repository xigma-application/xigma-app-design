import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// components
import CanvasNameLabelInput from './CanvasNameLabelInput';

const setup = (
  overrides: Partial<Parameters<typeof CanvasNameLabelInput>[0]> = {},
): { onCancel: ReturnType<typeof vi.fn>; onCommit: ReturnType<typeof vi.fn> } => {
  const onCancel = vi.fn();
  const onCommit = vi.fn();

  render(
    <CanvasNameLabelInput
      centerX={10}
      centerY={20}
      fontSize={12}
      height={16}
      initialValue="Frame 1"
      minWidth={50}
      onCancel={onCancel}
      onCommit={onCommit}
      {...overrides}
    />,
  );

  return { onCancel, onCommit };
};

describe('CanvasNameLabelInput', () => {
  it('should mount focused with the initial value pre-selected for overtype', () => {
    // before
    setup();
    const input = screen.getByRole<HTMLInputElement>('textbox');

    // result
    expect(input).toHaveValue('Frame 1');
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(7);
  });

  it('should anchor itself on the given screen centre, with the label size as a floor', () => {
    // before
    setup({ centerX: 10, centerY: 20, height: 16, minWidth: 50 });

    // result — centred via a translate(-50%, -50%), never narrower than the label
    expect(screen.getByRole('textbox')).toHaveStyle({ height: '16px', left: '10px', minWidth: '50px', top: '20px' });
  });

  it('should grow and shrink its character size with the typed text', async () => {
    // before
    setup();
    const input = screen.getByRole<HTMLInputElement>('textbox');

    // result — starts hugging "Frame 1"
    expect(input).toHaveAttribute('size', '7');

    // action — a longer value
    await userEvent.clear(input);
    await userEvent.type(input, 'Header section');
    expect(input).toHaveAttribute('size', '14');

    // action — back down to a short value
    await userEvent.clear(input);
    await userEvent.type(input, 'A');
    expect(input).toHaveAttribute('size', '1');
  });

  it('should commit the current text on Enter', async () => {
    // before
    const { onCommit } = setup();
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), 'Hero{Enter}');

    // result
    expect(onCommit).toHaveBeenCalledWith('Hero');
  });

  it('should commit on blur', () => {
    // before
    const { onCommit } = setup();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Card' } });
    fireEvent.blur(screen.getByRole('textbox'));

    // result
    expect(onCommit).toHaveBeenCalledWith('Card');
  });

  it('should cancel on Escape without committing', async () => {
    // before
    const { onCancel, onCommit } = setup();
    await userEvent.type(screen.getByRole('textbox'), '{Escape}');

    // result
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('should settle only once, so a blur right after Enter does not double-commit', async () => {
    // before
    const { onCommit } = setup();
    await userEvent.type(screen.getByRole('textbox'), '{Enter}');
    fireEvent.blur(screen.getByRole('textbox'));

    // result
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('should keep key presses from reaching the canvas keyboard shortcuts', () => {
    // before
    setup();
    const onKeyDown = vi.fn();
    document.addEventListener('keydown', onKeyDown);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'v' });
    document.removeEventListener('keydown', onKeyDown);

    // result
    expect(onKeyDown).not.toHaveBeenCalled();
  });
});
