// types
import { TTextPathSampler } from '../../pathSampler/types';

// utils
import { buildTunnelCenterline } from '../buildTunnelCenterline';

// a straight path along +x, world x === arc-length (pathCenter is added back on top, so this stays 0 here)
const buildStraightSampler = (overrides: Partial<TTextPathSampler> = {}): TTextPathSampler => ({
  cornerLengths: [],
  isClosed: false,
  nearestOffsetAtPoint: () => ({ distance: 0, offset: 0, point: { x: 0, y: 0 } }),
  sampleAtLength: (length) => ({ angleDegrees: 0, x: length, y: 0 }),
  totalLength: 100,
  ...overrides,
});

describe('buildTunnelCenterline', () => {
  it('should always include both endpoints, offset by pathCenter', () => {
    // result
    const points = buildTunnelCenterline(buildStraightSampler(), { x: 5, y: 5 }, 0, 8);

    expect(points[0]).toEqual({ x: 5, y: 5 });
    expect(points[points.length - 1]).toEqual({ x: 13, y: 5 });
  });

  it('should force an exact sample at a corner length inside the range', () => {
    // mock
    const sampler = buildStraightSampler({ cornerLengths: [37] });

    // result
    const points = buildTunnelCenterline(sampler, { x: 0, y: 0 }, 0, 100);

    expect(points).toContainEqual({ x: 37, y: 0 });
  });

  it('should collapse consecutive samples that land on (near) the same point', () => {
    // mock — an open path clamped at length 50: every requested length past 50 lands on the exact
    // same world point, the way an end-of-content clamp does
    const clampedSampler = buildStraightSampler({
      sampleAtLength: (length) => ({ angleDegrees: 0, x: Math.min(length, 50), y: 0 }),
      totalLength: 50,
    });

    // result — several regular grid stops between 45 and 60 all clamp to the same (50,0) point
    const points = buildTunnelCenterline(clampedSampler, { x: 0, y: 0 }, 45, 60);
    const duplicates = points.filter((point) => point.x === 50 && point.y === 0);

    expect(duplicates).toHaveLength(1);
  });

  it('should walk in reverse order when toLength is smaller than fromLength', () => {
    // result
    const points = buildTunnelCenterline(buildStraightSampler(), { x: 0, y: 0 }, 20, 5);

    expect(points[0]).toEqual({ x: 20, y: 0 });
    expect(points[points.length - 1]).toEqual({ x: 5, y: 0 });
  });
});
