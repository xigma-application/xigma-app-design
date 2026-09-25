import { fireEvent, render, screen } from '@testing-library/react';

// @xigma
import { BRUSH_CATEGORIES } from '@xigma/utils';

// components
import StrokeBrushTrigger from './StrokeBrushTrigger';

describe('StrokeBrushTrigger behaviors', () => {
  it('should preview a known brush and open on click', () => {
    // mock
    const onClick = vi.fn();

    // before
    render(
      <StrokeBrushTrigger ariaLabel="Brush" brushId={BRUSH_CATEGORIES[0].brushes[0].id} brushLabel="Pencil" isOpen onClick={onClick} />,
    );

    // find
    const trigger = screen.getByLabelText('Brush');

    // action
    fireEvent.click(trigger);

    // result
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByText('Pencil')).not.toBeInTheDocument();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should show the label for a mixed or unknown brush', () => {
    // before
    render(<StrokeBrushTrigger ariaLabel="Brush" brushId={undefined} brushLabel="Mixed" isOpen={false} onClick={vi.fn()} />);
    render(<StrokeBrushTrigger ariaLabel="Brush" brushId="missing" brushLabel="Unknown" isOpen={false} onClick={vi.fn()} />);

    // result
    expect(screen.getByText('Mixed')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
