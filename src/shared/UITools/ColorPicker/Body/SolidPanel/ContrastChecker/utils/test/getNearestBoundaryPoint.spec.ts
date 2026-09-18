// utils
import { getNearestBoundaryPoint } from '../getNearestBoundaryPoint';

const upper = {
  passSide: 'lighter' as const,
  points: [
    { s: 0, v: 80 },
    { s: 100, v: 80 },
  ],
};
const lower = {
  passSide: 'darker' as const,
  points: [
    { s: 0, v: 20 },
    { s: 100, v: 20 },
  ],
};

describe('getNearestBoundaryPoint', () => {
  it('should return null when there are no boundaries', () => {
    expect(getNearestBoundaryPoint([], { s: 50, v: 50 })).toBeNull();
  });

  it('should pick the upper boundary and the point straight above when closer to it', () => {
    expect(getNearestBoundaryPoint([upper, lower], { s: 30, v: 60 })).toEqual({ passSide: 'lighter', point: { s: 30, v: 80 } });
  });

  it('should pick the lower boundary when closer to it', () => {
    expect(getNearestBoundaryPoint([upper, lower], { s: 70, v: 35 })).toEqual({ passSide: 'darker', point: { s: 70, v: 20 } });
  });

  it('should ignore every clamped point of a curve, including the one that first reaches the top edge', () => {
    const clamped = {
      passSide: 'lighter' as const,
      points: [
        { s: 0, v: 50 },
        { s: 50, v: 100 },
        { s: 100, v: 100 },
      ],
    };

    expect(getNearestBoundaryPoint([clamped], { s: 100, v: 100 })).toEqual({ passSide: 'lighter', point: { s: 0, v: 50 } });
  });
});
