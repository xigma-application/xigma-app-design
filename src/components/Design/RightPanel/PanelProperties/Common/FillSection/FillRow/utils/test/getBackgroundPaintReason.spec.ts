// types
import { TPaint } from 'types/design/paint/types';

// utils
import { getBackgroundPaintReason } from '../getBackgroundPaintReason';

const paint = (type: string): Exclude<TPaint, { type: 'solid' }> => ({ type }) as Exclude<TPaint, { type: 'solid' }>;

describe('getBackgroundPaintReason', () => {
  it('should name the reason for each unsupported paint type', () => {
    // result
    expect(getBackgroundPaintReason(paint('image'))).toBe('imageBackground');
    expect(getBackgroundPaintReason(paint('pattern'))).toBe('patternBackground');
    expect(getBackgroundPaintReason(paint('video'))).toBe('videoBackground');
    expect(getBackgroundPaintReason(paint('linear'))).toBe('gradientBackground');
  });
});
