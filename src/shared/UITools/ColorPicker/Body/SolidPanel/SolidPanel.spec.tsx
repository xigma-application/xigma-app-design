import { fireEvent, render } from '@testing-library/react';

// components
import SolidPanel from './SolidPanel';
import { TooltipProvider } from 'shared';

describe('SolidPanel snapshots', () => {
  it('should render SolidPanel', () => {
    // before
    const colorModel = {
      hex: '#ff0000',
      hsv: { h: 0, s: 100, v: 100 },
      setAlpha: vi.fn(),
      setHex: vi.fn(),
      setHsv: vi.fn(),
      setPreset: vi.fn(),
    };
    const { asFragment } = render(
      <TooltipProvider>
        <SolidPanel alpha={100} colorModel={colorModel} />
      </TooltipProvider>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('SolidPanel behaviors', () => {
  it('should call colorModel.setAlpha when dragging the alpha slider', () => {
    // mock
    const colorModel = {
      hex: '#ff0000',
      hsv: { h: 0, s: 100, v: 100 },
      setAlpha: vi.fn(),
      setHex: vi.fn(),
      setHsv: vi.fn(),
      setPreset: vi.fn(),
    };

    // before
    const { container } = render(
      <TooltipProvider>
        <SolidPanel alpha={0} colorModel={colorModel} />
      </TooltipProvider>,
    );
    const alphaTrack = container.querySelector('[class*="AlphaSlider"]') as HTMLDivElement;

    vi.spyOn(alphaTrack, 'getBoundingClientRect').mockReturnValue({
      height: 16,
      left: 0,
      top: 0,
      width: 100,
    } as DOMRect);

    // action
    alphaTrack.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 40, clientY: 0, pointerId: 1 }));

    // result
    expect(colorModel.setAlpha).toHaveBeenCalledWith(40);
  });

  it('should call onOpenSampler when the sampler button is clicked', () => {
    // mock
    const colorModel = {
      hex: '#ff0000',
      hsv: { h: 0, s: 100, v: 100 },
      setAlpha: vi.fn(),
      setHex: vi.fn(),
      setHsv: vi.fn(),
      setPreset: vi.fn(),
    };
    const onOpenSampler = vi.fn();

    // before
    const { container } = render(
      <TooltipProvider>
        <SolidPanel alpha={100} colorModel={colorModel} onOpenSampler={onOpenSampler} />
      </TooltipProvider>,
    );
    const samplerButton = container.querySelector('[class*="Sampler__button"]') as HTMLButtonElement;

    // action
    fireEvent.click(samplerButton);

    // result
    expect(onOpenSampler).toHaveBeenCalledTimes(1);
  });
});
