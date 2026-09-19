// utils
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { getStampDots } from '../getStampDots';

const preset = { aspect: 1, dotScale: 1, dots: 100, sigma: 0.22 };

describe('getStampDots', () => {
  it('should draw the requested number of dots inside the cloud radius', () => {
    // action
    const dots = getStampDots({ x: 50, y: 50 }, 0, 20, preset, 60, createSeededRandom('dots'));

    // result
    expect(dots).toHaveLength(60);
    expect(dots.every((dot) => Math.hypot(dot.x - 50, dot.y - 50) <= 0.55 * 20 + 1e-9)).toBe(true);
  });

  it('should keep every dot at least the minimum radius', () => {
    // action
    const dots = getStampDots({ x: 0, y: 0 }, 0, 2, preset, 5, createSeededRandom('dots'));

    // result
    expect(dots.every((dot) => dot.radius >= 0.75)).toBe(true);
  });

  it('should stretch the cloud along the stamp angle for an elongated preset', () => {
    // action
    const dots = getStampDots({ x: 0, y: 0 }, 0, 20, { ...preset, aspect: 3 }, 300, createSeededRandom('dots'));
    const spreadX = Math.max(...dots.map((dot) => Math.abs(dot.x)));
    const spreadY = Math.max(...dots.map((dot) => Math.abs(dot.y)));

    // result
    expect(spreadX).toBeGreaterThan(spreadY);
  });

  it('should draw nothing for a stamp of no size', () => {
    // result
    expect(getStampDots({ x: 0, y: 0 }, 0, 0, preset, 10, createSeededRandom('dots'))).toEqual([]);
  });
});
