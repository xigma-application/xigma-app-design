// utils
import { projectPointOnSegment } from '../projectPointOnSegment';

describe('projectPointOnSegment', () => {
  it('should return the perpendicular foot when it falls inside the segment', () => {
    expect(projectPointOnSegment({ s: 5, v: 5 }, { s: 0, v: 0 }, { s: 10, v: 0 })).toEqual({ s: 5, v: 0 });
  });

  it('should clamp to the segment start when the projection falls before it', () => {
    expect(projectPointOnSegment({ s: -5, v: 3 }, { s: 0, v: 0 }, { s: 10, v: 0 })).toEqual({ s: 0, v: 0 });
  });

  it('should clamp to the segment end when the projection falls past it', () => {
    expect(projectPointOnSegment({ s: 20, v: 3 }, { s: 0, v: 0 }, { s: 10, v: 0 })).toEqual({ s: 10, v: 0 });
  });

  it('should return the start of a zero-length segment', () => {
    expect(projectPointOnSegment({ s: 4, v: 4 }, { s: 1, v: 1 }, { s: 1, v: 1 })).toEqual({ s: 1, v: 1 });
  });
});
