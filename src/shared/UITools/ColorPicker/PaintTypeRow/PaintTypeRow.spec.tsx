import { fireEvent, render, screen } from '@testing-library/react';

// components
import PaintTypeRow from './PaintTypeRow';
import { TooltipProvider } from 'shared';

// types
import { ColorPickerTab } from '../enums';

const renderPaintTypeRow = (
  activeTab: ColorPickerTab = ColorPickerTab.solid,
  onSelectTab: TFunc<[ColorPickerTab]> = vi.fn(),
): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PaintTypeRow activeTab={activeTab} onSelectTab={onSelectTab} />
    </TooltipProvider>,
  );

describe('PaintTypeRow behaviors', () => {
  it('should show the Solid button as the current, selected paint type', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.solid);

    // result
    const button = screen.getByRole('button', { name: 'Solid' });

    expect(button).toBeInTheDocument();
    expect(container.querySelector('[class*="PaintTypeRow__button--active"]')).toBeInTheDocument();
  });

  it('should show the Gradient button, not marked as the current paint type when solid is active', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.solid);

    // result
    const button = screen.getByRole('button', { name: 'Gradient' });

    expect(button).toBeInTheDocument();
    expect(button.className).not.toContain('PaintTypeRow__button--active');
    expect(container.querySelectorAll('[class*="PaintTypeRow__button--active"]')).toHaveLength(1);
  });

  it('should mark Gradient as active and Solid as inactive when the gradient tab is active', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.gradient);

    // result
    expect(screen.getByRole('button', { name: 'Gradient' }).className).toContain('PaintTypeRow__button--active');
    expect(screen.getByRole('button', { name: 'Solid' }).className).not.toContain('PaintTypeRow__button--active');
    expect(container.querySelectorAll('[class*="PaintTypeRow__button--active"]')).toHaveLength(1);
  });

  it('should call onSelectTab with gradient when the Gradient button is clicked', () => {
    // mock
    const onSelectTab = vi.fn();

    // before
    renderPaintTypeRow(ColorPickerTab.solid, onSelectTab);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Gradient' }));

    // result
    expect(onSelectTab).toHaveBeenCalledWith(ColorPickerTab.gradient);
  });

  it('should call onSelectTab with solid when the Solid button is clicked', () => {
    // mock
    const onSelectTab = vi.fn();

    // before
    renderPaintTypeRow(ColorPickerTab.gradient, onSelectTab);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Solid' }));

    // result
    expect(onSelectTab).toHaveBeenCalledWith(ColorPickerTab.solid);
  });
});
