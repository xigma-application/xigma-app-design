import { fireEvent, render, screen } from '@testing-library/react';

// components
import PaintTypeRow from './PaintTypeRow';
import { TooltipProvider } from 'shared';

// types
import { BlendMode } from 'types/design/enums';
import { ColorPickerTab } from '../enums';

const renderPaintTypeRow = (
  activeTab: ColorPickerTab = ColorPickerTab.solid,
  onSelectTab: TFunc<[ColorPickerTab]> = vi.fn(),
  blendMode: BlendMode = BlendMode.normal,
  onBlendModeChange: TFunc<[BlendMode]> = vi.fn(),
  onToggleContrastChecker?: TFunc,
  contrastCheckerActive = false,
): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PaintTypeRow
        activeTab={activeTab}
        blendMode={blendMode}
        contrastCheckerActive={contrastCheckerActive}
        onBlendModeChange={onBlendModeChange}
        onSelectTab={onSelectTab}
        onToggleContrastChecker={onToggleContrastChecker}
      />
    </TooltipProvider>,
  );

describe('PaintTypeRow behaviors', () => {
  it('should show the Solid button as the current, selected paint type', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.solid);

    // result
    const button = screen.getByRole('button', { name: 'Solid' });

    expect(button).toBeInTheDocument();
    expect(container.querySelector('[class*="ButtonIcon--active"]')).toBeInTheDocument();
  });

  it('should show the Gradient button, not marked as the current paint type when solid is active', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.solid);

    // result
    const button = screen.getByRole('button', { name: 'Gradient' });

    expect(button).toBeInTheDocument();
    expect(button.className).not.toContain('ButtonIcon--active');
    expect(container.querySelectorAll('[class*="ButtonIcon--active"]')).toHaveLength(1);
  });

  it('should mark Gradient as active and Solid as inactive when the gradient tab is active', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.gradient);

    // result
    expect(screen.getByRole('button', { name: 'Gradient' }).className).toContain('ButtonIcon--active');
    expect(screen.getByRole('button', { name: 'Solid' }).className).not.toContain('ButtonIcon--active');
    expect(container.querySelectorAll('[class*="ButtonIcon--active"]')).toHaveLength(1);
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

  it('should show the Pattern button, not marked as the current paint type when solid is active', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.solid);

    // result
    const button = screen.getByRole('button', { name: 'Pattern' });

    expect(button).toBeInTheDocument();
    expect(button.className).not.toContain('ButtonIcon--active');
    expect(container.querySelectorAll('[class*="ButtonIcon--active"]')).toHaveLength(1);
  });

  it('should mark Pattern as active when the pattern tab is active', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.pattern);

    // result
    expect(screen.getByRole('button', { name: 'Pattern' }).className).toContain('ButtonIcon--active');
    expect(container.querySelectorAll('[class*="ButtonIcon--active"]')).toHaveLength(1);
  });

  it('should call onSelectTab with pattern when the Pattern button is clicked', () => {
    // mock
    const onSelectTab = vi.fn();

    // before
    renderPaintTypeRow(ColorPickerTab.solid, onSelectTab);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Pattern' }));

    // result
    expect(onSelectTab).toHaveBeenCalledWith(ColorPickerTab.pattern);
  });

  it('should show the Image button, not marked as the current paint type when solid is active', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.solid);

    // result
    const button = screen.getByRole('button', { name: 'Image' });

    expect(button).toBeInTheDocument();
    expect(button.className).not.toContain('ButtonIcon--active');
    expect(container.querySelectorAll('[class*="ButtonIcon--active"]')).toHaveLength(1);
  });

  it('should mark Image as active when the image tab is active', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.image);

    // result
    expect(screen.getByRole('button', { name: 'Image' }).className).toContain('ButtonIcon--active');
    expect(container.querySelectorAll('[class*="ButtonIcon--active"]')).toHaveLength(1);
  });

  it('should call onSelectTab with image when the Image button is clicked', () => {
    // mock
    const onSelectTab = vi.fn();

    // before
    renderPaintTypeRow(ColorPickerTab.solid, onSelectTab);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Image' }));

    // result
    expect(onSelectTab).toHaveBeenCalledWith(ColorPickerTab.image);
  });

  it('should show the Shader button, not marked as the current paint type when solid is active', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.solid);

    // result
    const button = screen.getByRole('button', { name: 'Shader' });

    expect(button).toBeInTheDocument();
    expect(button.className).not.toContain('ButtonIcon--active');
    expect(container.querySelectorAll('[class*="ButtonIcon--active"]')).toHaveLength(1);
  });

  it('should mark Shader as active when the shader tab is active', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.shader);

    // result
    expect(screen.getByRole('button', { name: 'Shader' }).className).toContain('ButtonIcon--active');
    expect(container.querySelectorAll('[class*="ButtonIcon--active"]')).toHaveLength(1);
  });

  it('should call onSelectTab with shader when the Shader button is clicked', () => {
    // mock
    const onSelectTab = vi.fn();

    // before
    renderPaintTypeRow(ColorPickerTab.solid, onSelectTab);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Shader' }));

    // result
    expect(onSelectTab).toHaveBeenCalledWith(ColorPickerTab.shader);
  });

  it('should show the blend mode button as the last icon, wrapped so it can be pushed to the right', () => {
    // before
    const { container } = renderPaintTypeRow();
    const wrapper = container.querySelector('[class*="PaintTypeRow__extra"]');

    // result — the blend button lives in its own trailing wrapper, not as a sibling paint-type icon
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.querySelector('[aria-label="Apply blend mode to fill"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="PaintTypeRow_"]')?.lastElementChild).toBe(wrapper);
  });

  it('should not mark the blend mode button as active alongside a selected paint type tab', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.solid);

    // result — only the active tab icon should be marked, not the (closed) blend mode trigger
    expect(container.querySelectorAll('[class*="ButtonIcon--active"]')).toHaveLength(1);
  });

  it('should open the blend mode menu when its button is clicked', () => {
    // before
    renderPaintTypeRow();

    // action
    fireEvent.click(screen.getByLabelText('Apply blend mode to fill'));

    // result
    expect(screen.getByText('Multiply')).toBeInTheDocument();
  });

  it('should call onBlendModeChange with the picked blend mode', () => {
    // mock
    const onBlendModeChange = vi.fn();

    // before
    renderPaintTypeRow(ColorPickerTab.solid, vi.fn(), BlendMode.normal, onBlendModeChange);
    fireEvent.click(screen.getByLabelText('Apply blend mode to fill'));

    // action
    fireEvent.click(screen.getByText('Multiply', { exact: true }));

    // result
    expect(onBlendModeChange).toHaveBeenCalledWith(BlendMode.multiply);
  });
  it('should not show the contrast checker button when no toggle handler is given', () => {
    // before
    renderPaintTypeRow(ColorPickerTab.solid);

    // result
    expect(screen.queryByLabelText('Check color contrast')).not.toBeInTheDocument();
  });

  it('should show the contrast checker button next to the blend mode button on the solid tab, inside the trailing wrapper', () => {
    // before
    const { container } = renderPaintTypeRow(ColorPickerTab.solid, vi.fn(), BlendMode.normal, vi.fn(), vi.fn());
    const wrapper = container.querySelector('[class*="PaintTypeRow__extra"]');

    // result
    expect(wrapper?.querySelector('[aria-label="Check color contrast"]')).toBeInTheDocument();
    expect(wrapper?.querySelector('[aria-label="Apply blend mode to fill"]')).toBeInTheDocument();
  });

  it('should hide the contrast checker button on every non-solid tab, since contrast only applies to solid fills', () => {
    // before
    renderPaintTypeRow(ColorPickerTab.gradient, vi.fn(), BlendMode.normal, vi.fn(), vi.fn());

    // result
    expect(screen.queryByLabelText('Check color contrast')).not.toBeInTheDocument();
  });

  it('should mark the contrast checker button active when contrastCheckerActive is set', () => {
    // before
    renderPaintTypeRow(ColorPickerTab.solid, vi.fn(), BlendMode.normal, vi.fn(), vi.fn(), true);

    // result
    expect(screen.getByLabelText('Check color contrast').className).toContain('ButtonIcon--selected');
  });

  it('should call onToggleContrastChecker when the contrast checker button is clicked', () => {
    // mock
    const onToggleContrastChecker = vi.fn();

    // before
    renderPaintTypeRow(ColorPickerTab.solid, vi.fn(), BlendMode.normal, vi.fn(), onToggleContrastChecker);

    // action
    fireEvent.click(screen.getByLabelText('Check color contrast'));

    // result
    expect(onToggleContrastChecker).toHaveBeenCalled();
  });
});
