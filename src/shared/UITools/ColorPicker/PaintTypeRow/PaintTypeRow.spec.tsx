import { render, screen } from '@testing-library/react';

// components
import PaintTypeRow from './PaintTypeRow';
import { TooltipProvider } from 'shared';

const renderPaintTypeRow = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PaintTypeRow />
    </TooltipProvider>,
  );

describe('PaintTypeRow behaviors', () => {
  it('should show the Solid button as the current, selected paint type', () => {
    // before
    const { container } = renderPaintTypeRow();

    // result
    const button = screen.getByRole('button', { name: 'Solid' });

    expect(button).toBeInTheDocument();
    expect(container.querySelector('[class*="PaintTypeRow__button--active"]')).toBeInTheDocument();
  });
});
