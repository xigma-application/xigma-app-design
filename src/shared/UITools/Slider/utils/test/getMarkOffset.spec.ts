// others
import { SLIDER_THUMB_RADIUS } from '../../constants';

// utils
import { getMarkOffset } from '../getMarkOffset';

describe('getMarkOffset', () => {
  it('should place a mark where the thumb would sit for that value', () => {
    // result
    expect(getMarkOffset(25, 0, 100)).toBe(`calc(${SLIDER_THUMB_RADIUS}px + 0.25 * (100% - ${SLIDER_THUMB_RADIUS * 2}px))`);
  });
});
