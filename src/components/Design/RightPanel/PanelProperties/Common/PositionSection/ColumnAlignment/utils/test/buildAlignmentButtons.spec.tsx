import { render, screen } from '@testing-library/react';
import i18n from 'i18next';

// others
import { HORIZONTAL_ALIGNMENT_OPTIONS } from '../../constants';

// types
import { AlignmentHorizontal } from 'types/design/enums';

// utils
import { buildAlignmentButtons } from '../buildAlignmentButtons';

const t = i18n.t;
const noop = (): void => {};

describe('buildAlignmentButtons', () => {
  it('should return one button per option', () => {
    const buttons = buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, false, undefined, noop, t);

    expect(buttons).toHaveLength(HORIZONTAL_ALIGNMENT_OPTIONS.length);
  });

  it('should translate the aria label from the labelKey', () => {
    const [button] = buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, false, undefined, noop, t);

    expect(button?.ariaLabel).toBe('Align left');
  });

  it('should carry the disabled flag through', () => {
    const buttons = buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, true, undefined, noop, t);

    expect(buttons.every((button) => button.disabled)).toBe(true);
  });

  it('should mark the button whose key matches selectedKey as active', () => {
    const buttons = buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, false, AlignmentHorizontal.center, noop, t);

    expect(buttons.map((button) => button.active)).toEqual([false, true, false]);
  });

  it('should call onSelect with the option key when a button is clicked', () => {
    const onSelect = vi.fn();
    const [button] = buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, false, undefined, onSelect, t);

    button?.onClick();

    expect(onSelect).toHaveBeenCalledWith(AlignmentHorizontal.left);
  });

  it('should render the translated label and the keyboard shortcut in the tooltip', () => {
    const [button] = buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, false, undefined, noop, t);
    render(<div>{button?.tooltip}</div>);

    expect(screen.getByText('Align left')).toBeInTheDocument();
    expect(screen.getByText('⌥A')).toBeInTheDocument();
  });
});
