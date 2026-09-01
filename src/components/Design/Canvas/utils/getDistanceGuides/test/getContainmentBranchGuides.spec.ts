// utils
import { getContainmentBranchGuides } from '../getContainmentBranchGuides';

describe('getContainmentBranchGuides', () => {
  it('should draw padding guides when the active rect sits inside the target', () => {
    const active = { bottom: 50, left: 20, right: 70, top: 20 };
    const target = { bottom: 100, left: 0, right: 100, top: 0 };

    const guides = getContainmentBranchGuides(
      active,
      target,
      { height: 30, width: 50, x: 20, y: 20 },
      { height: 100, width: 100, x: 0, y: 0 },
    );

    expect(guides.lines).toHaveLength(4);
    expect(guides.lines.every((line) => !line.dashed)).toBe(true);
  });

  it('should draw the same padding guides when the target sits inside the active rect', () => {
    const active = { bottom: 100, left: 0, right: 100, top: 0 };
    const target = { bottom: 50, left: 20, right: 70, top: 20 };

    const guides = getContainmentBranchGuides(
      active,
      target,
      { height: 100, width: 100, x: 0, y: 0 },
      { height: 30, width: 50, x: 20, y: 20 },
    );

    expect(guides.lines).toHaveLength(4);
    expect(guides.lines.every((line) => !line.dashed)).toBe(true);
  });

  it('should report no guides when neither rect contains the other', () => {
    const active = { bottom: 100, left: 0, right: 100, top: 0 };
    const target = { bottom: 150, left: 50, right: 150, top: 50 };

    const guides = getContainmentBranchGuides(
      active,
      target,
      { height: 100, width: 100, x: 0, y: 0 },
      { height: 100, width: 100, x: 50, y: 50 },
    );

    expect(guides).toEqual({ labels: [], lines: [] });
  });
});
