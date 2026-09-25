// utils
import { getLineFrame } from '../getLineFrame';
import { makeLine } from './fixtures';

describe('getLineFrame', () => {
  it('should measure the line and point its normal to the left of its direction', () => {
    // before
    const frame = getLineFrame(makeLine());

    // result
    expect(frame).toEqual({
      end: { x: 100, y: 0 },
      halfWidth: 2,
      length: 100,
      normal: { x: 0, y: -1 },
      start: { x: 0, y: 0 },
      unit: { x: 1, y: 0 },
    });
  });

  it('should fall back to the default width and a rightward direction for a zero-length line without a width', () => {
    // before
    const frame = getLineFrame(makeLine({ strokeWidth: undefined, width: 0 }));

    // result
    expect(frame).toMatchObject({ halfWidth: 0.5, length: 0, unit: { x: 1, y: 0 } });
  });
});
