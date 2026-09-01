// utils
import { getVerticalGuide } from '../getVerticalGuide';

describe('getVerticalGuide', () => {
  it('should measure from the active rect to the target when the target sits below', () => {
    // before
    const { label, line } = getVerticalGuide(
      { bottom: 100, left: 0, right: 100, top: 0 },
      { bottom: 230, left: 20, right: 80, top: 150 },
      50,
    );

    // result
    expect(line).toEqual({ dashed: false, x1: 50, x2: 50, y1: 100, y2: 150 });
    expect(label).toEqual({ anchor: { x: 50, y: 125 }, offsetDirection: { x: -1, y: 0 }, text: '50' });
  });

  it('should measure from the target to the active rect when the target sits above', () => {
    // before
    const { label, line } = getVerticalGuide(
      { bottom: 250, left: 0, right: 100, top: 150 },
      { bottom: 80, left: 20, right: 80, top: 0 },
      50,
    );

    // result
    expect(line).toEqual({ dashed: false, x1: 50, x2: 50, y1: 80, y2: 150 });
    expect(label).toEqual({ anchor: { x: 50, y: 115 }, offsetDirection: { x: -1, y: 0 }, text: '70' });
  });
});
