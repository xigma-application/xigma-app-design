import { fireEvent, render, screen } from '@testing-library/react';
import i18n from 'i18next';

// components
import { ColumnDimensionsButtonIcons } from '../ColumnDimensionsButtonIcons';
import { TooltipProvider } from 'shared';

const t = i18n.t;

describe('ColumnDimensionsButtonIcons', () => {
  it('should return the lock aspect ratio button', () => {
    // action
    const buttonsIcon = ColumnDimensionsButtonIcons(false, vi.fn(), t);

    // result
    expect(buttonsIcon).toHaveLength(1);
  });

  it('should mark the button as selected when locked is true', () => {
    // before
    render(<TooltipProvider>{ColumnDimensionsButtonIcons(true, vi.fn(), t)}</TooltipProvider>);

    // result
    expect(screen.getByLabelText('Unlock aspect ratio')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should use the "unlock" aria-label when locked is true', () => {
    // before
    render(<TooltipProvider>{ColumnDimensionsButtonIcons(true, vi.fn(), t)}</TooltipProvider>);

    // result
    expect(screen.getByLabelText('Unlock aspect ratio')).toBeInTheDocument();
  });

  it('should not mark the button as selected when locked is false', () => {
    // before
    render(<TooltipProvider>{ColumnDimensionsButtonIcons(false, vi.fn(), t)}</TooltipProvider>);

    // result
    expect(screen.getByLabelText('Lock aspect ratio')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should call onToggleLock when the button is clicked', () => {
    // mock
    const onToggleLock = vi.fn();

    // before
    render(<TooltipProvider>{ColumnDimensionsButtonIcons(false, onToggleLock, t)}</TooltipProvider>);

    // action
    fireEvent.click(screen.getByLabelText('Lock aspect ratio'));

    // result
    expect(onToggleLock).toHaveBeenCalledTimes(1);
  });
});
