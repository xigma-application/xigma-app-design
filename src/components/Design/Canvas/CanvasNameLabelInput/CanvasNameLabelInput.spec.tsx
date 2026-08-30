import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// components
import CanvasNameLabelInput from './CanvasNameLabelInput';

// utils
import { getTextWidth } from 'utils/canvas/text/getTextWidth';

const FONT_SIZE = 12;

const setup = (
  overrides: Partial<Parameters<typeof CanvasNameLabelInput>[0]> = {},
): { onCancel: ReturnType<typeof vi.fn>; onCommit: ReturnType<typeof vi.fn> } => {
  const onCancel = vi.fn();
  const onCommit = vi.fn();

  render(
    <CanvasNameLabelInput
      angleDeg={0}
      fontSize={FONT_SIZE}
      height={16}
      initialValue="Frame 1"
      left={10}
      onCancel={onCancel}
      onCommit={onCommit}
      top={20}
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

  it('should anchor its vertical centre via translate(0, -50%), nudged 1px left of `left` so the text (not the border) lands there', () => {
    // before
    setup({ height: 16, left: 10, top: 20 });

    // result
    expect(screen.getByRole('textbox')).toHaveStyle({ height: '16px', left: '9px', top: '20px' });
  });

  it('should rotate around its own left edge to match a rotated frame, pivoting at the same point the WebGL label rotates around', () => {
    // before
    setup({ angleDeg: 30 });

    // result
    expect(screen.getByRole('textbox')).toHaveStyle({ transform: 'translate(0, -50%) rotate(30deg)' });
  });

  it('should size itself to the exact MSDF-measured width of the current text, not a character-count guess', () => {
    // before — this is what keeps the DOM input aligned with the WebGL-drawn label it replaces
    setup();
    const input = screen.getByRole<HTMLInputElement>('textbox');

    expect(input).toHaveStyle({ width: `${getTextWidth('Frame 1', FONT_SIZE)}px` });
  });

  it('should grow and shrink its measured width with the typed text', async () => {
    // before
    setup();
    const input = screen.getByRole<HTMLInputElement>('textbox');

    // action — a longer value
    await userEvent.clear(input);
    await userEvent.type(input, 'Header section');
    expect(input).toHaveStyle({ width: `${getTextWidth('Header section', FONT_SIZE)}px` });

    // action — back down to a short value
    await userEvent.clear(input);
    await userEvent.type(input, 'A');
    expect(input).toHaveStyle({ width: `${getTextWidth('A', FONT_SIZE)}px` });
  });

  it('should floor an empty value at a small, still-visible width', async () => {
    // before
    setup();
    const input = screen.getByRole<HTMLInputElement>('textbox');

    await userEvent.clear(input);

    // result
    expect(input.style.width).not.toBe('0px');
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
