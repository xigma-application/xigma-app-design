// utils
import { getEqualSpacingGuides } from '../getEqualSpacingGuides';

const ACTIVE = { height: 100, width: 100, x: 100, y: 100 };

describe('getEqualSpacingGuides', () => {
  it('should return no guides when there are no candidates', () => {
    // action
    const guides = getEqualSpacingGuides(ACTIVE, []);

    // result
    expect(guides).toEqual({ labels: [], lines: [] });
  });

  it('should combine a horizontal and a vertical equal-spacing guide when both patterns are present', () => {
    // before — active sits with a 20px gap left/right and a 20px gap top/bottom
    const candidates = [
      { bounds: { height: 100, width: 80, x: 0, y: 100 } },
      { bounds: { height: 100, width: 50, x: 220, y: 100 } },
      { bounds: { height: 80, width: 100, x: 100, y: 0 } },
      { bounds: { height: 50, width: 100, x: 100, y: 220 } },
    ];

    // action
    const guides = getEqualSpacingGuides(ACTIVE, candidates);

    // result — one line/label pair per gap, four gaps total
    expect(guides.lines).toHaveLength(4);
    expect(guides.labels).toHaveLength(4);
    expect(guides.labels.every((label) => label.text === '20')).toBe(true);
  });

  it('should return only the vertical guide when the horizontal pattern is not equal', () => {
    // before
    const candidates = [
      { bounds: { height: 100, width: 80, x: 0, y: 100 } },
      { bounds: { height: 100, width: 50, x: 260, y: 100 } },
      { bounds: { height: 80, width: 100, x: 100, y: 0 } },
      { bounds: { height: 50, width: 100, x: 100, y: 220 } },
    ];

    // action
    const guides = getEqualSpacingGuides(ACTIVE, candidates);

    // result — only the two vertical-gap lines/labels
    expect(guides.lines).toHaveLength(2);
    expect(guides.labels).toHaveLength(2);
  });
});
