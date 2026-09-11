// types
import { TGridTrackAffordanceExpandedGeometry } from '../getGridTrackAffordanceExpandedGeometry';

// utils
import { getGridTrackAffordanceHandleBands } from '../getGridTrackAffordanceHandleBands';

const CENTER = { x: 100, y: 50 };

const GEOMETRY: TGridTrackAffordanceExpandedGeometry = {
  badgeHeight: 20,
  badgeWidth: 52,
  chevronCenter: { x: 123, y: 50 },
  gripCenter: { x: 77, y: 50 },
  textCenter: { x: 100, y: 50 },
};

describe('getGridTrackAffordanceHandleBands', () => {
  it('should tile the full badge width across the three bands with no gaps', () => {
    const bands = getGridTrackAffordanceHandleBands(CENTER, GEOMETRY);
    const left = CENTER.x - GEOMETRY.badgeWidth / 2;
    const right = CENTER.x + GEOMETRY.badgeWidth / 2;

    expect(bands.grip.x).toBeCloseTo(left, 5);
    expect(bands.grip.x + bands.grip.width).toBeCloseTo(bands.value.x, 5);
    expect(bands.value.x + bands.value.width).toBeCloseTo(bands.chevron.x, 5);
    expect(bands.chevron.x + bands.chevron.width).toBeCloseTo(right, 5);
  });

  it('should span the full badge height for every band', () => {
    const bands = getGridTrackAffordanceHandleBands(CENTER, GEOMETRY);
    const top = CENTER.y - GEOMETRY.badgeHeight / 2;

    [bands.grip, bands.value, bands.chevron].forEach((band) => {
      expect(band.y).toBeCloseTo(top, 5);
      expect(band.height).toBe(GEOMETRY.badgeHeight);
    });
  });

  it('should place the boundary between two bands at the midpoint of their element centers', () => {
    const bands = getGridTrackAffordanceHandleBands(CENTER, GEOMETRY);

    expect(bands.value.x).toBeCloseTo((GEOMETRY.gripCenter.x + GEOMETRY.textCenter.x) / 2, 5);
    expect(bands.chevron.x).toBeCloseTo((GEOMETRY.textCenter.x + GEOMETRY.chevronCenter.x) / 2, 5);
  });
});
