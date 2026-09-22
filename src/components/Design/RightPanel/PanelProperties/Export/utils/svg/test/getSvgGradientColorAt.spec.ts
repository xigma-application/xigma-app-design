// types
import { TGradientStop } from 'types/design/paint/types';

// utils
import { getSvgGradientColorAt } from '../getSvgGradientColorAt';

const stops: TGradientStop[] = [
  { color: '#ff0000', opacity: 100, position: 0 },
  { color: '#0000ff', opacity: 50, position: 1 },
];

describe('getSvgGradientColorAt', () => {
  it('should return the exact stop color/opacity at a stop position', () => {
    expect(getSvgGradientColorAt(stops, 0)).toEqual({ color: '#ff0000', opacity: 1 });
    expect(getSvgGradientColorAt(stops, 1)).toEqual({ color: '#0000ff', opacity: 0.5 });
  });

  it('should linearly interpolate color and opacity between two stops', () => {
    expect(getSvgGradientColorAt(stops, 0.5)).toEqual({ color: '#800080', opacity: 0.75 });
  });

  it('should clamp a position below 0 or above 1 to the nearest stop', () => {
    expect(getSvgGradientColorAt(stops, -0.5)).toEqual({ color: '#ff0000', opacity: 1 });
    expect(getSvgGradientColorAt(stops, 1.5)).toEqual({ color: '#0000ff', opacity: 0.5 });
  });

  it('should hold the first stop flat for positions before it, and the last stop flat for positions after it', () => {
    const inset: TGradientStop[] = [
      { color: '#00ff00', opacity: 100, position: 0.25 },
      { color: '#ff00ff', opacity: 100, position: 0.75 },
    ];

    expect(getSvgGradientColorAt(inset, 0)).toEqual({ color: '#00ff00', opacity: 1 });
    expect(getSvgGradientColorAt(inset, 0.1)).toEqual({ color: '#00ff00', opacity: 1 });
    expect(getSvgGradientColorAt(inset, 1)).toEqual({ color: '#ff00ff', opacity: 1 });
  });

  it('should sort unsorted stops before interpolating', () => {
    const unsorted: TGradientStop[] = [
      { color: '#0000ff', opacity: 100, position: 1 },
      { color: '#ff0000', opacity: 100, position: 0 },
    ];

    expect(getSvgGradientColorAt(unsorted, 0.5)).toEqual({ color: '#800080', opacity: 1 });
  });

  it('should not divide by zero when two consecutive stops share the same position', () => {
    const hardCut: TGradientStop[] = [
      { color: '#ff0000', opacity: 100, position: 0 },
      { color: '#0000ff', opacity: 100, position: 0 },
    ];

    expect(getSvgGradientColorAt(hardCut, 0)).toEqual({ color: '#ff0000', opacity: 1 });
  });

  it('should bracket correctly across three or more stops', () => {
    const multi: TGradientStop[] = [
      { color: '#000000', opacity: 100, position: 0 },
      { color: '#ffffff', opacity: 100, position: 0.5 },
      { color: '#000000', opacity: 100, position: 1 },
    ];

    expect(getSvgGradientColorAt(multi, 0.25)).toEqual({ color: '#808080', opacity: 1 });
    expect(getSvgGradientColorAt(multi, 0.75)).toEqual({ color: '#808080', opacity: 1 });
  });
});
