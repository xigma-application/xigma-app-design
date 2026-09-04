// utils
import { getAutoLayoutContentBox } from '../getAutoLayoutContentBox';

describe('getAutoLayoutContentBox', () => {
  it('should return the frame’s own box unchanged when there is no padding', () => {
    const box = getAutoLayoutContentBox(
      { height: 100, width: 200, x: 10, y: 20 },
      { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
    );

    expect(box).toEqual({ height: 100, width: 200, x: 10, y: 20 });
  });

  it('should inset the box by the padding on every side', () => {
    const box = getAutoLayoutContentBox(
      { height: 100, width: 200, x: 10, y: 20 },
      { paddingBottom: 5, paddingLeft: 10, paddingRight: 20, paddingTop: 15 },
    );

    expect(box).toEqual({ height: 80, width: 170, x: 20, y: 35 });
  });

  it('should support asymmetric padding per side', () => {
    const box = getAutoLayoutContentBox(
      { height: 100, width: 100, x: 0, y: 0 },
      { paddingBottom: 0, paddingLeft: 40, paddingRight: 0, paddingTop: 0 },
    );

    expect(box).toEqual({ height: 100, width: 60, x: 40, y: 0 });
  });

  it('should clamp the content box to zero rather than going negative when padding exceeds the frame', () => {
    const box = getAutoLayoutContentBox(
      { height: 10, width: 10, x: 0, y: 0 },
      { paddingBottom: 20, paddingLeft: 20, paddingRight: 20, paddingTop: 20 },
    );

    expect(box).toEqual({ height: 0, width: 0, x: 20, y: 20 });
  });
});
