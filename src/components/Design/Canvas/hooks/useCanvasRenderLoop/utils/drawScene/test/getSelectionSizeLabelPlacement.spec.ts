// utils
import { getSelectionSizeLabelPlacement } from '../getSelectionSizeLabelPlacement';

describe('getSelectionSizeLabelPlacement', () => {
  it('should dock to the bottom edge, pointing straight down, for an unrotated rect', () => {
    // before
    const placement = getSelectionSizeLabelPlacement({ height: 100, rotation: 0, width: 200, x: 0, y: 0 });

    // result
    expect(placement.anchor.x).toBeCloseTo(100, 5);
    expect(placement.anchor.y).toBeCloseTo(100, 5);
    expect(placement.offsetDirection.x).toBeCloseTo(0, 5);
    expect(placement.offsetDirection.y).toBeCloseTo(1, 5);
    expect(placement.angleDeg).toBeCloseTo(0, 5);
  });

  it('should keep the label parallel to the bottom edge while the rotation stays under 45deg', () => {
    // before — rotated 30deg, the bottom edge is still the most downward-facing
    const placement = getSelectionSizeLabelPlacement({ height: 100, rotation: 30, width: 200, x: 0, y: 0 });

    // result
    expect(placement.angleDeg).toBeCloseTo(30, 5);
    expect(placement.offsetDirection.y).toBeGreaterThan(0);
  });

  it('should hop to the neighbouring edge once the rotation crosses 45deg so the label stays near the visual bottom', () => {
    // before — rotated 60deg, the original right edge is now the most downward-facing
    const flat = getSelectionSizeLabelPlacement({ height: 100, rotation: 0, width: 200, x: 0, y: 0 });
    const rotated = getSelectionSizeLabelPlacement({ height: 100, rotation: 60, width: 200, x: 0, y: 0 });

    // result — the docked edge changed, and the label reorients to run along the new edge
    expect(rotated.anchor).not.toEqual(flat.anchor);
    expect(rotated.angleDeg).toBeCloseTo(-30, 5);
    expect(rotated.offsetDirection.y).toBeGreaterThan(0);
  });

  it('should stay pinned to the visual bottom, upright, once the rect is flipped 180deg', () => {
    // before — rotated 180deg, the original top edge now faces down and sits at the visual bottom
    const placement = getSelectionSizeLabelPlacement({ height: 100, rotation: 180, width: 200, x: 0, y: 0 });

    // result
    expect(placement.anchor.x).toBeCloseTo(100, 5);
    expect(placement.anchor.y).toBeCloseTo(100, 5);
    expect(placement.offsetDirection.y).toBeCloseTo(1, 5);
    expect(placement.angleDeg).toBeCloseTo(0, 5);
  });

  it('should never tilt the label beyond 45deg, whatever the rotation', () => {
    // result
    for (let rotation = 0; rotation < 360; rotation += 7) {
      const { angleDeg } = getSelectionSizeLabelPlacement({ height: 80, rotation, width: 200, x: 0, y: 0 });

      expect(Math.abs(angleDeg)).toBeLessThanOrEqual(45.0001);
    }
  });
});
