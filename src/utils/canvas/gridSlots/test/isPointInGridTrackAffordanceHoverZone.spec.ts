// utils
import { isPointInGridTrackAffordanceHoverZone } from '../isPointInGridTrackAffordanceHoverZone';

const CENTER = { x: 100, y: 50 };

describe('isPointInGridTrackAffordanceHoverZone', () => {
  it('should hit a column pill when the point sits exactly on its center', () => {
    expect(isPointInGridTrackAffordanceHoverZone(CENTER, CENTER, 'column', 1)).toBe(true);
  });

  it('should hit a column pill further along its long (horizontal) axis than its short axis', () => {
    expect(isPointInGridTrackAffordanceHoverZone({ x: 130, y: 50 }, CENTER, 'column', 1)).toBe(true);
    expect(isPointInGridTrackAffordanceHoverZone({ x: 100, y: 74 }, CENTER, 'column', 1)).toBe(true);
    expect(isPointInGridTrackAffordanceHoverZone({ x: 100, y: 80 }, CENTER, 'column', 1)).toBe(false);
  });

  it('should hit a row pill further along its long (vertical) axis than its short axis', () => {
    expect(isPointInGridTrackAffordanceHoverZone({ x: 100, y: 82 }, CENTER, 'row', 1)).toBe(true);
    expect(isPointInGridTrackAffordanceHoverZone({ x: 124, y: 50 }, CENTER, 'row', 1)).toBe(true);
    expect(isPointInGridTrackAffordanceHoverZone({ x: 130, y: 50 }, CENTER, 'row', 1)).toBe(false);
  });

  it('should shrink the hit zone in local units as the viewport zooms in', () => {
    expect(isPointInGridTrackAffordanceHoverZone({ x: 130, y: 50 }, CENTER, 'column', 1)).toBe(true);
    expect(isPointInGridTrackAffordanceHoverZone({ x: 130, y: 50 }, CENTER, 'column', 2)).toBe(false);
  });
});
