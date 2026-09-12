import { fireEvent, render, screen } from '@testing-library/react';
import i18n from 'i18next';

// components
import { ColumnFlowButtonIcons } from '../ColumnFlowButtonIcons';
import { TooltipProvider } from 'shared';

const t = i18n.t;

describe('ColumnFlowButtonIcons', () => {
  it('should return an empty array when the flow is not "horizontal" or "grid"', () => {
    // action
    const buttonsIcon = ColumnFlowButtonIcons('freeForm', false, vi.fn(), t, true, vi.fn());

    // result
    expect(buttonsIcon).toHaveLength(0);
  });

  it('should return an empty array when the flow is "vertical"', () => {
    // action
    const buttonsIcon = ColumnFlowButtonIcons('vertical', false, vi.fn(), t, true, vi.fn());

    // result
    expect(buttonsIcon).toHaveLength(0);
  });

  it('should return the wrap button when the flow is "horizontal"', () => {
    // action
    const buttonsIcon = ColumnFlowButtonIcons('horizontal', false, vi.fn(), t, true, vi.fn());

    // result
    expect(buttonsIcon).toHaveLength(1);
  });

  it('should mark the wrap button as selected when wrap is true', () => {
    // before
    render(<TooltipProvider>{ColumnFlowButtonIcons('horizontal', true, vi.fn(), t, true, vi.fn())}</TooltipProvider>);

    // result
    expect(screen.getByLabelText('Wrap')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onWrapChange when the wrap button is clicked', () => {
    // mock
    const onWrapChange = vi.fn();

    // before
    render(<TooltipProvider>{ColumnFlowButtonIcons('horizontal', false, onWrapChange, t, true, vi.fn())}</TooltipProvider>);

    // action
    fireEvent.click(screen.getByLabelText('Wrap'));

    // result
    expect(onWrapChange).toHaveBeenCalledTimes(1);
  });

  it('should return the automatic-positioning toggle button when the flow is "grid"', () => {
    // action
    const buttonsIcon = ColumnFlowButtonIcons('grid', false, vi.fn(), t, true, vi.fn());

    // result
    expect(buttonsIcon).toHaveLength(1);
  });

  it('should mark the automatic-positioning button as selected when gridAutoPlacement is true', () => {
    // before
    render(<TooltipProvider>{ColumnFlowButtonIcons('grid', false, vi.fn(), t, true, vi.fn())}</TooltipProvider>);

    // result
    expect(screen.getByLabelText('Toggle automatic positioning')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should not mark the automatic-positioning button as selected when gridAutoPlacement is false', () => {
    // before
    render(<TooltipProvider>{ColumnFlowButtonIcons('grid', false, vi.fn(), t, false, vi.fn())}</TooltipProvider>);

    // result
    expect(screen.getByLabelText('Toggle automatic positioning')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should call onGridAutoPlacementChange when the automatic-positioning button is clicked', () => {
    // mock
    const onGridAutoPlacementChange = vi.fn();

    // before
    render(<TooltipProvider>{ColumnFlowButtonIcons('grid', false, vi.fn(), t, true, onGridAutoPlacementChange)}</TooltipProvider>);

    // action
    fireEvent.click(screen.getByLabelText('Toggle automatic positioning'));

    // result
    expect(onGridAutoPlacementChange).toHaveBeenCalledTimes(1);
  });
});
