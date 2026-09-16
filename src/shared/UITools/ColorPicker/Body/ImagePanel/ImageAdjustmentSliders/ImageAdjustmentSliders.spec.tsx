import { render, screen } from '@testing-library/react';

// components
import ImageAdjustmentSliders from './ImageAdjustmentSliders';

// hooks
import { TUseImagePanelResult } from '../hooks/useImagePanel';

const buildImagePanel = (overrides: Partial<TUseImagePanelResult> = {}): TUseImagePanelResult => ({
  contrast: 0,
  exposure: 0,
  fillMode: 'fill',
  highlights: 0,
  imageUrl: null,
  saturation: 0,
  setContrast: vi.fn(),
  setExposure: vi.fn(),
  setFillMode: vi.fn(),
  setHighlights: vi.fn(),
  setImage: vi.fn(),
  setSaturation: vi.fn(),
  setShadows: vi.fn(),
  setTemperature: vi.fn(),
  setTint: vi.fn(),
  shadows: 0,
  temperature: 0,
  tint: 0,
  ...overrides,
});

describe('ImageAdjustmentSliders snapshots', () => {
  it('should render ImageAdjustmentSliders', () => {
    // before
    const { asFragment } = render(<ImageAdjustmentSliders imagePanel={buildImagePanel()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ImageAdjustmentSliders behaviors', () => {
  it('should render every adjustment slider with its label, in the given order', () => {
    // before
    render(<ImageAdjustmentSliders imagePanel={buildImagePanel()} />);

    // result
    const labels = ['Exposure', 'Contrast', 'Saturation', 'Temperature', 'Tint', 'Highlights', 'Shadows'];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: label })).toBeInTheDocument();
    });
  });

  it('should reflect each field of the imagePanel result as its own slider value', () => {
    // before
    render(
      <ImageAdjustmentSliders
        imagePanel={buildImagePanel({
          contrast: -10,
          exposure: 42,
          highlights: 30,
          saturation: 20,
          shadows: -30,
          temperature: -20,
          tint: 15,
        })}
      />,
    );

    // result
    expect(screen.getByRole('slider', { name: 'Exposure' })).toHaveAttribute('aria-valuenow', '42');
    expect(screen.getByRole('slider', { name: 'Contrast' })).toHaveAttribute('aria-valuenow', '-10');
    expect(screen.getByRole('slider', { name: 'Saturation' })).toHaveAttribute('aria-valuenow', '20');
    expect(screen.getByRole('slider', { name: 'Temperature' })).toHaveAttribute('aria-valuenow', '-20');
    expect(screen.getByRole('slider', { name: 'Tint' })).toHaveAttribute('aria-valuenow', '15');
    expect(screen.getByRole('slider', { name: 'Highlights' })).toHaveAttribute('aria-valuenow', '30');
    expect(screen.getByRole('slider', { name: 'Shadows' })).toHaveAttribute('aria-valuenow', '-30');
  });

  it('should drive each slider between -100 and 100', () => {
    // before
    render(<ImageAdjustmentSliders imagePanel={buildImagePanel()} />);

    // result
    expect(screen.getByRole('slider', { name: 'Exposure' })).toHaveAttribute('aria-valuemin', '-100');
    expect(screen.getByRole('slider', { name: 'Exposure' })).toHaveAttribute('aria-valuemax', '100');
  });

  it('should call setExposure when the Exposure slider is dragged', () => {
    // mock
    const setExposure = vi.fn();

    // before
    render(<ImageAdjustmentSliders imagePanel={buildImagePanel({ setExposure })} />);
    const track = screen.getByRole('slider', { name: 'Exposure' }) as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 24, left: 0, top: 0, width: 100 } as DOMRect);

    // action — a quarter of the way across a [-100, 100] range lands on -50
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 25, clientY: 0, pointerId: 1 }));

    // result
    expect(setExposure).toHaveBeenCalledWith(-50);
  });
});
