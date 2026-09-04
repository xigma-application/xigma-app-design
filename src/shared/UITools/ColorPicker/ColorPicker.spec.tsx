import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComponentProps } from 'react';

// components
import ColorPicker from './ColorPicker';
import { TooltipProvider } from 'shared';

// utils
import { registerColorPixelSampler } from 'utils/canvas/colorPixelSampler/colorPixelSamplerRegistry';

const renderColorPicker = (props: ComponentProps<typeof ColorPicker>): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ColorPicker {...props} />
    </TooltipProvider>,
  );

describe('ColorPicker snapshots', () => {
  it('should render ColorPicker with the trigger visible and the panel closed', () => {
    // before
    const { asFragment } = renderColorPicker({
      onChange: vi.fn(),
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColorPicker behaviors', () => {
  it('should call onChange with the clicked preset hex and alpha, overriding the current value', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderColorPicker({ onChange, trigger: <button type="button">Open</button>, value: { alpha: 50, hex: '#ff0000' } });

    // action
    fireEvent.click(screen.getByText('Open'));

    // find — the first preset is opaque white
    const swatch = document.querySelectorAll('[class*="Footer__colors"] > div')[0];

    // action
    fireEvent.click(swatch);

    // result
    expect(onChange).toHaveBeenCalledWith({ alpha: 100, hex: '#ffffff' });
  });

  it('should call onChange with a half-alpha preset when a partially transparent swatch is clicked', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderColorPicker({ onChange, trigger: <button type="button">Open</button>, value: { alpha: 100, hex: '#ff0000' } });

    // action
    fireEvent.click(screen.getByText('Open'));

    // find — the fourth preset is black at 50% alpha
    const swatch = document.querySelectorAll('[class*="Footer__colors"] > div')[3];

    // action
    fireEvent.click(swatch);

    // result
    expect(onChange).toHaveBeenCalledWith({ alpha: 50, hex: '#000000' });
  });

  it('should open the sampler and apply a sampled color on pick, closing the overlay', async () => {
    // mock
    const onChange = vi.fn();
    const colors = Array.from({ length: 49 }, () => ({ a: 255, b: 0, g: 255, r: 0 }));
    const unregister = registerColorPixelSampler(async () => colors);

    // before
    renderColorPicker({ onChange, trigger: <button type="button">Open</button>, value: { alpha: 100, hex: '#ff0000' } });

    fireEvent.click(screen.getByText('Open'));

    const samplerButton = document.querySelector('[class*="Sampler__button"]') as HTMLButtonElement;

    // action
    fireEvent.click(samplerButton);

    // result — body pointer-events disabled while sampling, only the mask itself receives clicks
    expect(document.body.style.pointerEvents).toBe('none');

    // action
    fireEvent.mouseMove(window, { clientX: 20, clientY: 30 });

    await waitFor(() => expect(document.querySelector('[class*="ColorGridMask"]')).toBeInTheDocument());

    fireEvent.click(document.querySelector('[class*="ColorGridMask"]') as HTMLDivElement);

    // result — the registered sampler resolves a fixed green, so picking applies its hex
    expect(onChange).toHaveBeenCalledWith({ alpha: 100, hex: '#00ff00' });
    expect(document.querySelector('[class*="ColorGridMask"]')).not.toBeInTheDocument();

    // after
    unregister();
  });

  it('should apply a caller-supplied triggerClassName to the trigger button', () => {
    // before
    renderColorPicker({
      onChange: vi.fn(),
      trigger: <span>Open</span>,
      triggerClassName: 'custom-trigger',
      value: { alpha: 100, hex: '#ff0000' },
    });

    // result
    expect(screen.getByRole('button', { name: 'Open' }).className).toContain('custom-trigger');
  });

  it('should not switch to the gradient tab since it is disabled', () => {
    // before
    renderColorPicker({ onChange: vi.fn(), trigger: <button type="button">Open</button>, value: { alpha: 100, hex: '#ff0000' } });

    // action
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Gradient'));

    // result
    expect(screen.getByText('Solid').className).toMatch(/active/);
  });

  it('should report onDragStart/onDragEnd when dragging a slider inside the popover', () => {
    // mock
    const onDragEnd = vi.fn();
    const onDragStart = vi.fn();

    // before
    renderColorPicker({
      onChange: vi.fn(),
      onDragEnd,
      onDragStart,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    fireEvent.click(screen.getByText('Open'));

    const alphaTrack = document.querySelector('[class*="AlphaSlider"]') as HTMLDivElement;

    vi.spyOn(alphaTrack, 'getBoundingClientRect').mockReturnValue({ height: 16, left: 0, top: 0, width: 100 } as DOMRect);

    // action
    alphaTrack.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 40, clientY: 0, pointerId: 1 }));
    alphaTrack.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));

    // result
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
