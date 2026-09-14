import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComponentProps } from 'react';
import { Provider } from 'react-redux';

// components
import ColorPicker from './ColorPicker';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

// utils
import { registerColorPixelSampler } from 'utils/canvas/colorPixelSampler/colorPixelSamplerRegistry';

const renderColorPicker = (props: ComponentProps<typeof ColorPicker>): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColorPicker {...props} />
      </TooltipProvider>
    </Provider>,
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
  it('should pass a solid preview to a function trigger by default', () => {
    // mock
    const trigger = vi.fn().mockReturnValue(<button type="button">Open</button>);

    // before
    renderColorPicker({ onChange: vi.fn(), trigger, value: { alpha: 100, hex: '#ff0000' } });

    // result
    expect(trigger).toHaveBeenCalledWith({ type: 'solid', value: { alpha: 100, hex: '#ff0000' } });
  });

  it('should pass a gradient preview to a function trigger once the Gradient tab is selected', () => {
    // mock
    const trigger = vi.fn().mockReturnValue(<button type="button">Open</button>);

    // before
    renderColorPicker({ onChange: vi.fn(), trigger, value: { alpha: 100, hex: '#ff0000' } });
    fireEvent.click(screen.getByText('Open'));

    // action
    fireEvent.click(screen.getByText('Gradient'));

    // result
    const lastPreview = trigger.mock.calls[trigger.mock.calls.length - 1][0];

    expect(lastPreview.type).toBe('gradient');
    expect(lastPreview.style.background).toContain('linear-gradient');
  });

  it('should call onGradientChange immediately when the Gradient tab is opened, even without touching the panel', () => {
    // mock
    const onGradientChange = vi.fn();

    // before
    renderColorPicker({
      onChange: vi.fn(),
      onGradientChange,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });
    fireEvent.click(screen.getByText('Open'));

    // action
    fireEvent.click(screen.getByText('Gradient'));

    // result
    expect(onGradientChange).toHaveBeenCalledWith({ angle: 0, stops: expect.any(Array), type: 'gradient-linear' });
  });

  it('should call onChange with the current solid value when switching back from Gradient to Solid', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderColorPicker({
      onChange,
      onGradientChange: vi.fn(),
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Gradient'));
    onChange.mockClear();

    // action
    fireEvent.click(screen.getByText('Solid'));

    // result
    expect(onChange).toHaveBeenCalledWith({ alpha: 100, hex: '#ff0000' });
  });

  it('should call onGradientChange with the updated stops, type, and angle when the gradient panel changes', () => {
    // mock
    const onGradientChange = vi.fn();

    // before
    renderColorPicker({
      onChange: vi.fn(),
      onGradientChange,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Gradient'));

    // action
    const rotateButton = screen.getByLabelText('Rotate gradient');

    fireEvent.click(rotateButton);

    // result
    expect(onGradientChange).toHaveBeenCalledWith(expect.objectContaining({ angle: 90, type: 'gradient-linear' }));
  });

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

  it('should switch to the gradient panel when the gradient tab is clicked', () => {
    // before
    renderColorPicker({ onChange: vi.fn(), trigger: <button type="button">Open</button>, value: { alpha: 100, hex: '#ff0000' } });

    // action
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Gradient'));

    // result
    expect(screen.getByText('Gradient').className).toMatch(/active/);
    expect(screen.getByText('Stops')).toBeInTheDocument();
  });

  it('should hide the preset swatches footer on the gradient tab', () => {
    // before
    renderColorPicker({ onChange: vi.fn(), trigger: <button type="button">Open</button>, value: { alpha: 100, hex: '#ff0000' } });

    // action
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Gradient'));

    // result
    expect(document.querySelector('[class*="Footer__colors"]')).not.toBeInTheDocument();
  });

  it('should show Custom/Libraries tabs instead of Solid/Gradient when simple is set', () => {
    // before
    renderColorPicker({
      onChange: vi.fn(),
      simple: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    // action
    fireEvent.click(screen.getByText('Open'));

    // result
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('Libraries')).toBeInTheDocument();
    expect(screen.queryByText('Solid')).not.toBeInTheDocument();
    expect(screen.queryByText('Gradient')).not.toBeInTheDocument();
  });

  it('should not show the paint type row by default', () => {
    // before
    renderColorPicker({ onChange: vi.fn(), trigger: <button type="button">Open</button>, value: { alpha: 100, hex: '#ff0000' } });

    // action
    fireEvent.click(screen.getByText('Open'));

    // result
    expect(screen.queryByRole('button', { name: 'Solid' })).not.toBeInTheDocument();
  });

  it('should show the Solid paint type button when paintTypeRow is set', () => {
    // before
    renderColorPicker({
      onChange: vi.fn(),
      paintTypeRow: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    // action
    fireEvent.click(screen.getByText('Open'));

    // result
    expect(screen.getByRole('button', { name: 'Solid' })).toBeInTheDocument();
  });

  it('should switch the body to the gradient panel when the paint type row Gradient button is clicked, even in simple mode', () => {
    // before
    renderColorPicker({
      onChange: vi.fn(),
      onGradientChange: vi.fn(),
      paintTypeRow: true,
      simple: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    // action
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByRole('button', { name: 'Gradient' }));

    // result
    expect(screen.getByText('Stops')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gradient' }).className).toMatch(/active/);
  });

  it('should keep the Custom tab visually active after switching the paint type row to Gradient — Custom/Libraries and Solid/Gradient are independent states', () => {
    // before
    renderColorPicker({
      onChange: vi.fn(),
      onGradientChange: vi.fn(),
      paintTypeRow: true,
      simple: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    // action
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByRole('button', { name: 'Gradient' }));

    // result
    expect(screen.getByText('Custom').className).toMatch(/active/);
  });

  it('should switch back to the solid panel when the paint type row Solid button is clicked', () => {
    // before
    renderColorPicker({
      onChange: vi.fn(),
      onGradientChange: vi.fn(),
      paintTypeRow: true,
      simple: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    // action
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByRole('button', { name: 'Gradient' }));
    fireEvent.click(screen.getByRole('button', { name: 'Solid' }));

    // result
    expect(screen.queryByText('Stops')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Solid' }).className).toMatch(/active/);
  });

  it('should show a plain title label instead of any tabs when title is set', () => {
    // before
    renderColorPicker({
      onChange: vi.fn(),
      title: 'Custom',
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    // action
    fireEvent.click(screen.getByText('Open'));

    // result
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.queryByText('Libraries')).not.toBeInTheDocument();
    expect(screen.queryByText('Solid')).not.toBeInTheDocument();
    expect(screen.queryByText('Gradient')).not.toBeInTheDocument();
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
