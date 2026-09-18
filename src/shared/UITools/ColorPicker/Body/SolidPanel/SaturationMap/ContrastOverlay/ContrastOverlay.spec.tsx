import { render } from '@testing-library/react';

// components
import ContrastOverlay from './ContrastOverlay';

// types
import { TContrastBoundary } from '../../ContrastChecker/types';

const darkerBoundary: TContrastBoundary = {
  passSide: 'darker',
  points: [
    { s: 0, v: 20 },
    { s: 100, v: 40 },
  ],
};

const lighterBoundary: TContrastBoundary = {
  passSide: 'lighter',
  points: [
    { s: 0, v: 80 },
    { s: 100, v: 90 },
  ],
};

describe('ContrastOverlay', () => {
  it('should render one curve per boundary', () => {
    // before
    const { container } = render(<ContrastOverlay boundaries={[lighterBoundary, darkerBoundary]} />);

    // result
    expect(container.querySelectorAll('polyline')).toHaveLength(2);
  });

  it('should convert v to a top-origin y coordinate when drawing a curve', () => {
    // before
    const { container } = render(<ContrastOverlay boundaries={[darkerBoundary]} />);

    // result — v=20 -> y=80, v=40 -> y=60
    expect(container.querySelector('polyline')?.getAttribute('points')).toBe('0,80 100,60');
  });

  it('should render a dotted fail region for a single boundary', () => {
    // before
    const { container } = render(<ContrastOverlay boundaries={[darkerBoundary]} />);

    // result
    expect(container.querySelector('[class*="ContrastOverlay__dots"]')).not.toBeNull();
  });

  it('should render no dotted fail region and no curves when there are no boundaries', () => {
    // before
    const { container } = render(<ContrastOverlay boundaries={[]} />);

    // result
    expect(container.querySelector('[class*="ContrastOverlay__dots"]')).toBeNull();
    expect(container.querySelectorAll('polyline')).toHaveLength(0);
  });

  it('should clip the dotted region to the fail polygon in percentage coordinates', () => {
    // before
    const { container } = render(<ContrastOverlay boundaries={[darkerBoundary]} />);
    const dots = container.querySelector('[class*="ContrastOverlay__dots"]') as HTMLElement;

    // result — a darker-side boundary fails above the curve, so it closes up to v=100 (y=0%)
    expect(dots.style.clipPath).toContain('0% 80%');
    expect(dots.style.clipPath).toContain('100% 0%');
  });

  it('should be marked aria-hidden, since it is purely decorative', () => {
    // before
    const { container } = render(<ContrastOverlay boundaries={[darkerBoundary]} />);

    // result
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
