import { render, screen } from '@testing-library/react';

// components
import ImageAdjustmentSliders from './ImageAdjustmentSliders';

// types
import { TImageAdjustments } from 'types/design/paint/types';

const DEFAULT_ADJUSTMENTS: TImageAdjustments = {
  contrast: 0,
  exposure: 0,
  highlights: 0,
  saturation: 0,
  shadows: 0,
  temperature: 0,
  tint: 0,
};

describe('ImageAdjustmentSliders snapshots', () => {
  it('should render ImageAdjustmentSliders', () => {
    // before
    const { asFragment } = render(<ImageAdjustmentSliders adjustments={DEFAULT_ADJUSTMENTS} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ImageAdjustmentSliders behaviors', () => {
  it('should render every adjustment slider with its label, in the given order', () => {
    // before
    render(<ImageAdjustmentSliders adjustments={DEFAULT_ADJUSTMENTS} />);

    // result
    const labels = ['Exposure', 'Contrast', 'Saturation', 'Temperature', 'Tint', 'Highlights', 'Shadows'];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: label })).toBeInTheDocument();
    });
  });

  it('should reflect each field of the given adjustments as its own slider value', () => {
    // before
    render(
      <ImageAdjustmentSliders
        adjustments={{
          contrast: -10,
          exposure: 42,
          highlights: 30,
          saturation: 20,
          shadows: -30,
          temperature: -20,
          tint: 15,
        }}
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
    render(<ImageAdjustmentSliders adjustments={DEFAULT_ADJUSTMENTS} />);

    // result
    expect(screen.getByRole('slider', { name: 'Exposure' })).toHaveAttribute('aria-valuemin', '-100');
    expect(screen.getByRole('slider', { name: 'Exposure' })).toHaveAttribute('aria-valuemax', '100');
  });

  it('should call onAdjustmentChange with the field name when the Exposure slider is dragged', () => {
    // mock
    const onAdjustmentChange = vi.fn();

    // before
    render(<ImageAdjustmentSliders adjustments={DEFAULT_ADJUSTMENTS} onAdjustmentChange={onAdjustmentChange} />);
    const track = screen.getByRole('slider', { name: 'Exposure' }) as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 24, left: 0, top: 0, width: 100 } as DOMRect);

    // action — a quarter of the way across a [-100, 100] range lands on -50
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 25, clientY: 0, pointerId: 1 }));

    // result
    expect(onAdjustmentChange).toHaveBeenCalledWith('exposure', -50);
  });

  it('should default to the zeroed adjustments and a no-op change handler when neither is given', () => {
    // before
    render(<ImageAdjustmentSliders />);

    // result
    expect(screen.getByRole('slider', { name: 'Exposure' })).toHaveAttribute('aria-valuenow', '0');
  });
});
