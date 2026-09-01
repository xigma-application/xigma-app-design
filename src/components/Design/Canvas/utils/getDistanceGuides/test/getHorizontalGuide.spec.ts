// utils
import { getHorizontalGuide } from '../getHorizontalGuide';

describe('getHorizontalGuide', () => {
  it('should measure from the active rect to the target when the target sits to the right', () => {
    // before
    const { label, line } = getHorizontalGuide(
      { bottom: 100, left: 0, right: 100, top: 0 },
      { bottom: 80, left: 150, right: 230, top: 20 },
      50,
    );

    // result
    expect(line).toEqual({ dashed: false, x1: 100, x2: 150, y1: 50, y2: 50 });
    expect(label).toEqual({ anchor: { x: 125, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '50' });
  });

  it('should measure from the target to the active rect when the target sits to the left', () => {
    // before
    const { label, line } = getHorizontalGuide(
      { bottom: 100, left: 150, right: 250, top: 0 },
      { bottom: 80, left: 0, right: 80, top: 20 },
      50,
    );

    // result
    expect(line).toEqual({ dashed: false, x1: 80, x2: 150, y1: 50, y2: 50 });
    expect(label).toEqual({ anchor: { x: 115, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '70' });
  });
});
