import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// components
import CanvasValueLabelInput from './CanvasValueLabelInput';

const setup = (
  overrides: Partial<Parameters<typeof CanvasValueLabelInput>[0]> = {},
): { onCancel: ReturnType<typeof vi.fn>; onCommit: ReturnType<typeof vi.fn> } => {
  const onCancel = vi.fn();
  const onCommit = vi.fn();

  render(
    <CanvasValueLabelInput
      centerX={10}
      centerY={20}
      fontSize={11}
      height={24}
      initialValue={414}
      minWidth={40}
      onCancel={onCancel}
      onCommit={onCommit}
      {...overrides}
    />,
  );

  return { onCancel, onCommit };
};

describe('CanvasValueLabelInput', () => {
  it('should mount focused with the initial value pre-selected for overtype', () => {
    // before
    setup();
    const input = screen.getByRole<HTMLInputElement>('textbox');

    // result
    expect(input).toHaveValue('414');
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(3);
  });

  it('should anchor itself on the given screen centre, with the badge width as a floor', () => {
    // before
    setup({ centerX: 10, centerY: 20, height: 24, minWidth: 40 });

    // result — centred via a translate(-50%, -50%), never narrower than the badge
    expect(screen.getByRole('textbox')).toHaveStyle({ height: '24px', left: '10px', minWidth: '40px', top: '20px' });
  });

  it('should grow and shrink its character size with the typed text', async () => {
    // before
    setup();
    const input = screen.getByRole<HTMLInputElement>('textbox');

    // result — starts hugging "414"
    expect(input).toHaveAttribute('size', '3');

    // action — a longer value
    await userEvent.clear(input);
    await userEvent.type(input, '1234567');
    expect(input).toHaveAttribute('size', '7');

    // action — back down to a short value
    await userEvent.clear(input);
    await userEvent.type(input, '8');
    expect(input).toHaveAttribute('size', '1');
  });

  it('should commit the current text on Enter', async () => {
    // before
    const { onCommit } = setup();
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), '250{Enter}');

    // result
    expect(onCommit).toHaveBeenCalledWith('250');
  });

  it('should commit on blur', () => {
    // before
    const { onCommit } = setup();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '90' } });
    fireEvent.blur(screen.getByRole('textbox'));

    // result
    expect(onCommit).toHaveBeenCalledWith('90');
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
