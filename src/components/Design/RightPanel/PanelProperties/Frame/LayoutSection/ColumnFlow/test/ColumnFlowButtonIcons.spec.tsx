import { fireEvent, render, screen } from '@testing-library/react';
import i18n from 'i18next';

// components
import { ColumnFlowButtonIcons } from '../ColumnFlowButtonIcons';
import { TooltipProvider } from 'shared';

const t = i18n.t;

describe('ColumnFlowButtonIcons', () => {
  it('should return an empty array when the flow is not "horizontal"', () => {
    // action
    const buttonsIcon = ColumnFlowButtonIcons('freeForm', false, vi.fn(), t);

    // result
    expect(buttonsIcon).toHaveLength(0);
  });

  it('should return the wrap button when the flow is "horizontal"', () => {
    // action
    const buttonsIcon = ColumnFlowButtonIcons('horizontal', false, vi.fn(), t);

    // result
    expect(buttonsIcon).toHaveLength(1);
  });

  it('should mark the wrap button as selected when wrap is true', () => {
    // before
    render(<TooltipProvider>{ColumnFlowButtonIcons('horizontal', true, vi.fn(), t)}</TooltipProvider>);

    // result
    expect(screen.getByLabelText('Wrap')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onWrapChange when the wrap button is clicked', () => {
    // mock
    const onWrapChange = vi.fn();

    // before
    render(<TooltipProvider>{ColumnFlowButtonIcons('horizontal', false, onWrapChange, t)}</TooltipProvider>);

    // action
    fireEvent.click(screen.getByLabelText('Wrap'));

    // result
    expect(onWrapChange).toHaveBeenCalledTimes(1);
  });
});
