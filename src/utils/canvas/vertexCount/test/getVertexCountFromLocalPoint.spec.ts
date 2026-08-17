// utils
import { getVertexCountFromLocalPoint } from '../getVertexCountFromLocalPoint';

const CENTER = { x: 200, y: 50 };
const MIN = 3;
const MAX = 8;

describe('getVertexCountFromLocalPoint', () => {
  it('should return the minimum when the point sits exactly on the center (localX is 0)', () => {
    // result
    expect(getVertexCountFromLocalPoint({ x: 200, y: 999 }, CENTER, MIN, MAX)).toBe(3);
  });

  it('should return the minimum once the point crosses past the center onto the negative-x side', () => {
    // result
    expect(getVertexCountFromLocalPoint({ x: 150, y: 999 }, CENTER, MIN, MAX)).toBe(3);
  });

  it("should snap to a candidate count when the point sits exactly on that candidate's own target angle", () => {
    // mock — a point 100 world units from the center, along count 5's own target angle
    expect(getVertexCountFromLocalPoint({ x: 295.105652, y: 19.098301 }, CENTER, MIN, MAX)).toBe(5);
  });

  it('should tie toward the lower (first-encountered) count when the point sits exactly at the midpoint between two adjacent target angles', () => {
    // mock — exactly halfway (in angle space) between count 5's and count 6's target angles
    expect(getVertexCountFromLocalPoint({ x: 291.354546, y: 9.326336 }, CENTER, MIN, MAX)).toBe(5);
  });

  it('should snap to the higher count once nudged just past that midpoint toward its target angle', () => {
    // mock — the same midpoint, nudged 0.001 radians toward count 6's target angle
    expect(getVertexCountFromLocalPoint({ x: 291.313826, y: 9.235001 }, CENTER, MIN, MAX)).toBe(6);
  });

  it('should snap back to the lower count once nudged just the other way, toward its target angle', () => {
    // mock — the same midpoint, nudged 0.001 radians toward count 5's target angle
    expect(getVertexCountFromLocalPoint({ x: 291.395174, y: 9.417711 }, CENTER, MIN, MAX)).toBe(5);
  });
});
