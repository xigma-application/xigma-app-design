// utils
import { getAnchorTriggerStyle } from '../getAnchorTriggerStyle';

describe('getAnchorTriggerStyle', () => {
  it("should fix-position an inert element over the anchor's own rect", () => {
    // mock
    const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 30, 40) } };

    // result
    expect(getAnchorTriggerStyle(anchorRef)).toEqual({
      height: 40,
      left: 10,
      pointerEvents: 'none',
      position: 'fixed',
      top: 20,
      width: 30,
    });
  });
});
