import { fireEvent, render, screen } from '@testing-library/react';

// @xigma
import { BRUSH_CATEGORIES } from '@xigma/utils';

// components
import StrokeBrushOption from './StrokeBrushOption';

const brush = BRUSH_CATEGORIES[0].brushes[0];

describe('StrokeBrushOption behaviors', () => {
  it('should show the brush and report clicks and hovering', () => {
    // mock
    const handlers = { onClick: vi.fn(), onMouseEnter: vi.fn(), onMouseLeave: vi.fn() };

    // before
    const { container } = render(<StrokeBrushOption {...handlers} brush={brush} label="Pencil" selected />);

    // find
    const option = container.firstChild as HTMLElement;

    // action
    fireEvent.mouseEnter(option);
    fireEvent.click(option);
    fireEvent.mouseLeave(option);

    // result
    expect(screen.getByText('Pencil')).toBeInTheDocument();
    expect(option.className).toMatch(/selected/);
    expect(handlers.onClick).toHaveBeenCalledTimes(1);
    expect(handlers.onMouseEnter).toHaveBeenCalledTimes(1);
    expect(handlers.onMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('should hide the check of an unselected brush', () => {
    // before
    const { container } = render(
      <StrokeBrushOption brush={brush} label="Pencil" onClick={vi.fn()} onMouseEnter={vi.fn()} onMouseLeave={vi.fn()} selected={false} />,
    );

    // result
    expect((container.firstChild as HTMLElement).className).not.toMatch(/selected/);
  });
});
