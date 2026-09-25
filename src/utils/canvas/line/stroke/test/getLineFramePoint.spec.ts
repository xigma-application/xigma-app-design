// utils
import { getLineFrame } from '../getLineFrame';
import { getLineFramePoint } from '../getLineFramePoint';
import { makeLine } from './fixtures';

describe('getLineFramePoint', () => {
  it('should walk along the line and step sideways along its normal', () => {
    // result
    expect(getLineFramePoint(getLineFrame(makeLine()), 30, 5)).toEqual({ x: 30, y: -5 });
  });
});
