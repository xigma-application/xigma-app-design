import { render, screen } from '@testing-library/react';
import i18n from 'i18next';

// others
import { HORIZONTAL_ALIGNMENT_OPTIONS } from '../../constants';

// utils
import { buildAlignmentButtons } from '../buildAlignmentButtons';

const t = i18n.t;

describe('buildAlignmentButtons', () => {
  it('should return one button per option', () => {
    // action
    const buttons = buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, false, t);

    // result
    expect(buttons).toHaveLength(HORIZONTAL_ALIGNMENT_OPTIONS.length);
  });

  it('should translate the aria label from the labelKey', () => {
    // action
    const [button] = buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, false, t);

    // result
    expect(button?.ariaLabel).toBe('Align left');
  });

  it('should carry the disabled flag through', () => {
    // action
    const buttons = buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, true, t);

    // result
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });

  it('should render the translated label and the keyboard shortcut in the tooltip', () => {
    // action
    const [button] = buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, false, t);
    render(<div>{button?.tooltip}</div>);

    // result
    expect(screen.getByText('Align left')).toBeInTheDocument();
    expect(screen.getByText('⌥A')).toBeInTheDocument();
  });
});
