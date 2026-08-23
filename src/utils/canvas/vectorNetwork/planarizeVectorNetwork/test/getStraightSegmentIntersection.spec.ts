// utils
import { getStraightSegmentIntersection } from '../getStraightSegmentIntersection';

describe('getStraightSegmentIntersection', () => {
  it('should find the crossing point and its t/u parameters when two segments genuinely cross', () => {
    // result
    expect(getStraightSegmentIntersection({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: -50 }, { x: 50, y: 50 })).toEqual({
      point: { x: 50, y: 0 },
      t: 0.5,
      u: 0.5,
    });
  });

  it('should return null when the two segments are parallel (zero denominator)', () => {
    // result
    expect(getStraightSegmentIntersection({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 10 }, { x: 100, y: 10 })).toBeNull();
  });

  it('should return null when the segments’ own lines cross outside either segment’s finite range', () => {
    // mock — these lines cross at (50,0), but the second "segment" only spans x in [200,300]
    // result
    expect(getStraightSegmentIntersection({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: -50 }, { x: 200, y: 50 })).toBeNull();
  });

  it('should return null when the crossing lands exactly on an endpoint (t or u === 0 or 1)', () => {
    // mock — crosses exactly at (0,0), the shared start of segment A
    // result
    expect(getStraightSegmentIntersection({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: -50 }, { x: 0, y: 50 })).toBeNull();
  });

  it('should return null for a near-parallel pair sharing an endpoint, even though float error pushes t/u past the exact 0/1 boundary (regression: a live wheel-shape cut produced this exact configuration and corrupted the face walk)', () => {
    // mock — two segments that share endpoint (142.872, 93.699) exactly, meeting there at a shallow
    // angle (near-zero denominator); solving for their parametric intersection lands at
    // t≈0.9999999999979919 / u≈1.000000000006024 — several t/u-epsilons past the true boundary, even
    // though the actual computed point is ~1.3e-10 world units from the shared vertex. A t/u-space
    // tolerance can't catch this (the near-zero denominator amplifies the same float error into a much
    // larger t/u deviation); only checking the real point's distance from the endpoints does.
    // result
    expect(
      getStraightSegmentIntersection(
        { x: 150.274, y: 27.569 },
        { x: 142.872, y: 93.699 },
        { x: 135.503, y: 159.538 },
        { x: 142.872, y: 93.699 },
      ),
    ).toBeNull();
  });

  it('should return null for two near-parallel segments even when the computed "crossing" lands several world units from any endpoint (regression: a live random cut produced two near-collinear closing segments; denominator ≈ -7.7e-12, resolved point 3.2 units from the nearest real endpoint, still inside the strict t/u bounds)', () => {
    // mock — two closing segments that both head toward the same rough area from very different
    // distances, at a shallow-enough angle that sin(theta) ≈ 1.3e-15 — the intersection solve is too
    // ill-conditioned to trust regardless of where its numeric answer lands
    // result
    expect(
      getStraightSegmentIntersection(
        { x: 224.32181749324485, y: 175.22789956780082 },
        { x: 178.36933519913475, y: 205.10800559740431 },
        { x: 86.63971240684192, y: 264.75420354481196 },
        { x: 178.36933519913475, y: 205.10800559740431 },
      ),
    ).toBeNull();
  });
});
