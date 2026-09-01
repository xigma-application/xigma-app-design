// utils
import { getDiagonalGuides } from '../getDiagonalGuides';

describe('getDiagonalGuides', () => {
  it('should draw two solid measurement lines plus a dashed corner bracket when the target sits below-right', () => {
    const active = { bottom: 100, left: 0, right: 100, top: 0 };
    const target = { bottom: 340, left: 200, right: 250, top: 300 };

    const guides = getDiagonalGuides(active, target, { height: 100, width: 100, x: 0, y: 0 });

    expect(guides.lines).toEqual([
      { dashed: false, x1: 100, x2: 200, y1: 50, y2: 50 },
      { dashed: false, x1: 50, x2: 50, y1: 100, y2: 300 },
      { dashed: true, x1: 200, x2: 200, y1: 50, y2: 300 },
      { dashed: true, x1: 50, x2: 200, y1: 300, y2: 300 },
    ]);
    expect(guides.labels).toEqual([
      { anchor: { x: 150, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '100' },
      { anchor: { x: 50, y: 200 }, offsetDirection: { x: -1, y: 0 }, text: '200' },
    ]);
  });

  it('should mirror the bracket when the target sits above-left', () => {
    const active = { bottom: 340, left: 200, right: 250, top: 300 };
    const target = { bottom: 100, left: 0, right: 100, top: 0 };

    const guides = getDiagonalGuides(active, target, { height: 40, width: 50, x: 200, y: 300 });

    expect(guides.lines).toEqual([
      { dashed: false, x1: 100, x2: 200, y1: 320, y2: 320 },
      { dashed: false, x1: 225, x2: 225, y1: 100, y2: 300 },
      { dashed: true, x1: 100, x2: 100, y1: 320, y2: 100 },
      { dashed: true, x1: 225, x2: 100, y1: 100, y2: 100 },
    ]);
  });
});
