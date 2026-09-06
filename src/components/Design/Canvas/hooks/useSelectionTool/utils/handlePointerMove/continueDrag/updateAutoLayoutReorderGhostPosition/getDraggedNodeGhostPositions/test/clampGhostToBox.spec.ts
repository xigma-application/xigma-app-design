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
});
