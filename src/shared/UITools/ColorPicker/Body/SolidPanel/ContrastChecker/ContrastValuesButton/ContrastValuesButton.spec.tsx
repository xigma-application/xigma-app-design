import { fireEvent, render, screen } from '@testing-library/react';

// components
import ContrastValuesButton from './ContrastValuesButton';
import { TooltipProvider } from 'shared';

const renderContrastValuesButton = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ContrastValuesButton backgroundColor="#535353" foregroundColor="#f2adad" ratio={4.15} />
    </TooltipProvider>,
  );

describe('ContrastValuesButton', () => {
  it('should render the ratio as a button', () => {
    // before
    renderContrastValuesButton();

    // result
    expect(screen.getByRole('button', { name: '4.15 : 1' })).toBeInTheDocument();
  });

  it('should not show the color values until opened', () => {
    // before
    renderContrastValuesButton();

    // result
    expect(screen.queryByText('Foreground')).not.toBeInTheDocument();
  });

  it('should show the foreground and background hex values when clicked', () => {
    // before
    renderContrastValuesButton();

    // action
    fireEvent.click(screen.getByRole('button', { name: '4.15 : 1' }));

    // result
    expect(screen.getByText('Foreground')).toBeInTheDocument();
    expect(screen.getByText('F2ADAD')).toBeInTheDocument();
    expect(screen.getByText('Background')).toBeInTheDocument();
    expect(screen.getByText('535353')).toBeInTheDocument();
  });

  it('should mark the button as open while the values are shown', () => {
    // before
    renderContrastValuesButton();
    const button = screen.getByRole('button', { name: '4.15 : 1' });

    expect(button.className).not.toContain('ContrastValuesButton--open');

    // action
    fireEvent.click(button);

    // result
    expect(button.className).toContain('ContrastValuesButton--open');
  });

  it('should show the tooltip on focus', async () => {
    // before
    renderContrastValuesButton();

    // action
    fireEvent.focus(screen.getByRole('button', { name: '4.15 : 1' }));

    // result
    expect(await screen.findAllByText('View color values', {}, { timeout: 2000 })).not.toHaveLength(0);
  });

  it('should paint the swatch icon with the real background and foreground colors through its data-svg-property parts', () => {
    // before
    const { container } = renderContrastValuesButton();
    const svg = container.querySelector('svg') as SVGElement;

    // result
    expect(svg.querySelector('[data-svg-property="fill-background"]')).not.toBeNull();
    expect(svg.querySelector('[data-svg-property="fill-foreground"]')).not.toBeNull();
    expect(svg.style.getPropertyValue('--contrast-background')).toBe('#535353');
    expect(svg.style.getPropertyValue('--contrast-foreground')).toBe('#f2adad');
  });
});
