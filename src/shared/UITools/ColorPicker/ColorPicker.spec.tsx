import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ComponentProps } from 'react';
import { Provider } from 'react-redux';

// components
import ColorPicker from './ColorPicker';
import { TooltipProvider } from 'shared';

// others
import { contrastCheckerStateCache } from 'shared/UITools/ColorPicker/Body/SolidPanel/ContrastChecker/utils/contrastCheckerStateCache';
import { DEFAULT_CONTRAST_CHECKER_STATE } from 'shared/UITools/ColorPicker/Body/SolidPanel/ContrastChecker/constants';

// store
import { store } from 'store';

// types
import { BlendMode } from 'types/design/enums';

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
  beforeEach(() => {
    contrastCheckerStateCache.current = DEFAULT_CONTRAST_CHECKER_STATE;
  });

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

  it('should dock a stop color panel when a gradient stop swatch is clicked, and undock it on close', () => {
    // mock
    renderColorPicker({ onChange: vi.fn(), trigger: <button type="button">Open</button>, value: { alpha: 100, hex: '#ff0000' } });
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Gradient'));

    // action
    fireEvent.click(screen.getAllByLabelText('Stop color')[0]);

    // result
    const dockedPanel = document.querySelector('[class*="ColorPicker__docked"]') as HTMLElement;

    expect(dockedPanel).toBeInTheDocument();
    expect(document.querySelector('[class*="StopColorPanel"]')).toBeInTheDocument();

    // action — close it, from the docked panel's own close button
    fireEvent.click(within(dockedPanel).getByLabelText('Close'));

    // result
    expect(document.querySelector('[class*="ColorPicker__docked"]')).not.toBeInTheDocument();
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

  it('should call onBlendModeChange with the picked blend mode from the paint type row', () => {
    // mock
    const onBlendModeChange = vi.fn();

    // before
    renderColorPicker({
      onBlendModeChange,
      onChange: vi.fn(),
      paintTypeRow: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    // action
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByLabelText('Apply blend mode to fill'));
    fireEvent.click(screen.getByText('Multiply', { exact: true }));

    // result
    expect(onBlendModeChange).toHaveBeenCalledWith(BlendMode.multiply);
  });

  it('should reflect a non-default blend mode in the paint type row trigger icon', () => {
    // before
    const defaultRender = renderColorPicker({
      onChange: vi.fn(),
      paintTypeRow: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    fireEvent.click(defaultRender.getByText('Open'));
    const defaultIcon = defaultRender.getByLabelText('Apply blend mode to fill').querySelector('svg')?.outerHTML;

    defaultRender.unmount();

    const multiplyRender = renderColorPicker({
      blendMode: BlendMode.multiply,
      onChange: vi.fn(),
      paintTypeRow: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    fireEvent.click(multiplyRender.getByText('Open'));
    const multiplyIcon = multiplyRender.getByLabelText('Apply blend mode to fill').querySelector('svg')?.outerHTML;

    // result
    expect(multiplyIcon).not.toBe(defaultIcon);
  });

  it('should not show the contrast checker toggle when no contrastBackgroundColor is given', () => {
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
    expect(screen.queryByLabelText('Check color contrast')).not.toBeInTheDocument();
  });

  it('should reveal the contrast ratio row, computed against contrastBackgroundColor, when the contrast toggle is clicked', () => {
    // before — pure black on a white background is 21:1
    renderColorPicker({
      contrastBackgroundColor: '#ffffff',
      onChange: vi.fn(),
      paintTypeRow: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#000000' },
    });

    fireEvent.click(screen.getByText('Open'));

    expect(screen.queryByText(/: 1/)).not.toBeInTheDocument();

    // action
    fireEvent.click(screen.getByLabelText('Check color contrast'));

    // result
    expect(screen.getByText('21.00 : 1')).toBeInTheDocument();
  });

  it('should draw the contrast overlay on the saturation map only while the checker is active', () => {
    // before
    renderColorPicker({
      contrastBackgroundColor: '#ffffff',
      onChange: vi.fn(),
      paintTypeRow: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    fireEvent.click(screen.getByText('Open'));

    expect(document.querySelector('[class*="ContrastOverlay"]')).toBeNull();

    // action
    fireEvent.click(screen.getByLabelText('Check color contrast'));

    // result
    expect(document.querySelector('[class*="ContrastOverlay"]')).not.toBeNull();
  });

  it('should auto-correct a failing color through onChange when the ratio is clicked', () => {
    // mock
    const onChange = vi.fn();

    // before — near-white on white background fails
    renderColorPicker({
      contrastBackgroundColor: '#ffffff',
      onChange,
      paintTypeRow: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#f0f0f0' },
    });

    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByLabelText('Check color contrast'));

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Auto-correct to the nearest compliant color' }));

    // result
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].hex).not.toBe('#f0f0f0');
  });

  it('should show the blend mode message instead of a ratio and overlay when contrast is unsupported', () => {
    // before
    renderColorPicker({
      contrastBackgroundColor: '#ffffff',
      contrastUnsupportedReason: 'foreground',
      onChange: vi.fn(),
      paintTypeRow: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    fireEvent.click(screen.getByText('Open'));

    // action
    fireEvent.click(screen.getByLabelText('Check color contrast'));

    // result
    expect(screen.getByText('Foreground has blend mode')).toBeInTheDocument();
    expect(screen.queryByText(/: 1/)).not.toBeInTheDocument();
    expect(document.querySelector('[class*="ContrastOverlay"]')).toBeNull();
  });

  it('should hide the contrast toggle again when switching away from the solid tab', () => {
    // before
    renderColorPicker({
      contrastBackgroundColor: '#ffffff',
      onChange: vi.fn(),
      onGradientChange: vi.fn(),
      paintTypeRow: true,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    fireEvent.click(screen.getByText('Open'));

    expect(screen.getByLabelText('Check color contrast')).toBeInTheDocument();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Gradient' }));

    // result
    expect(screen.queryByLabelText('Check color contrast')).not.toBeInTheDocument();
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

  it('should render the panel already open when initialOpen is set, without needing a trigger click', () => {
    // before
    renderColorPicker({
      initialOpen: true,
      onChange: vi.fn(),
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    // result
    expect(screen.getByText('Solid')).toBeInTheDocument();
  });

  it('should still close normally via a real interaction after being seeded open by initialOpen', () => {
    // mock
    const onOpenChange = vi.fn();

    // before
    renderColorPicker({
      initialOpen: true,
      onChange: vi.fn(),
      onOpenChange,
      trigger: <button type="button">Open</button>,
      value: { alpha: 100, hex: '#ff0000' },
    });

    // action — clicking the trigger again toggles an already-open popover closed, like any other open picker
    fireEvent.click(screen.getByText('Open'));

    // result
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should default to closed when initialOpen is not set', () => {
    // before
    renderColorPicker({ onChange: vi.fn(), trigger: <button type="button">Open</button>, value: { alpha: 100, hex: '#ff0000' } });

    // result
    expect(screen.queryByText('Solid')).not.toBeInTheDocument();
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
