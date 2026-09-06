// utils
import { clampGhostToBox } from '../clampGhostToBox';

const BOX = { height: 300, width: 400, x: 0, y: 0 };

describe('clampGhostToBox', () => {
  it('returns the point untouched when it already fits inside the box', () => {
    expect(clampGhostToBox({ x: 120, y: 90 }, BOX, 100, 100)).toEqual({ x: 120, y: 90 });
  });

  it('pulls a point that has flown past the far edge back so the ghost stays fully inside', () => {
    // a member dragged into the "chasm" past the last row/column
    expect(clampGhostToBox({ x: 900, y: 500 }, BOX, 100, 100)).toEqual({ x: 300, y: 200 });
  });

  it('clamps against the near edges too', () => {
    expect(clampGhostToBox({ x: -50, y: -30 }, BOX, 100, 100)).toEqual({ x: 0, y: 0 });
  });

  it('pins to the near edge when the member is larger than the box', () => {
    expect(clampGhostToBox({ x: 200, y: 200 }, BOX, 600, 600)).toEqual({ x: 0, y: 0 });
  });

  it('is a no-op when there is no clamp box', () => {
    expect(clampGhostToBox({ x: 900, y: 900 }, undefined, 100, 100)).toEqual({ x: 900, y: 900 });
  });

  it('clamps in the box’s own (un-rotated) local space when a rotation and pivot are given', () => {
    // mock — the box's own centre (200,150); a world ghost at (200,850) is the same as a LOCAL point
    // of (900,150) — past the box's right edge — once un-rotated by the frame's 90deg
    const center = { x: 200, y: 150 };

    // action — clamped in local space to (300,150) (pulled back to the box's far edge), then
    // re-expressed in world terms as (200,250)
    const result = clampGhostToBox({ x: 200, y: 850 }, BOX, 100, 100, 90, center);

    expect(result.x).toBeCloseTo(200, 5);
    expect(result.y).toBeCloseTo(250, 5);

    // sanity: without any rotation, that same raw point is treated as already-local and clamps
    // to somewhere else entirely — the rotation genuinely changes which point is "past the edge"
    expect(clampGhostToBox({ x: 200, y: 850 }, BOX, 100, 100)).not.toEqual({ x: 200, y: 250 });
  });

  it('defaults the rotation pivot to the clamp box’s own centre when none is given', () => {
    // action — 90deg rotation with no explicit pivot uses the box's own centre (200,150), same as
    // the previous test's explicit one
    const result = clampGhostToBox({ x: 200, y: 850 }, BOX, 100, 100, 90);

    // result
    expect(result.x).toBeCloseTo(200, 5);
    expect(result.y).toBeCloseTo(250, 5);
  });
});
