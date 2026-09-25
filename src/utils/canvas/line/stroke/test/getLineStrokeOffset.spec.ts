// types
import { StrokeAlign } from 'types/design/enums';

// utils
import { getLineFrame } from '../getLineFrame';
import { getLineStrokeOffset } from '../getLineStrokeOffset';
import { makeLine } from './fixtures';

describe('getLineStrokeOffset', () => {
  it('should move an inside stroke half its width to the left of the line and an outside one to the right', () => {
    // mock
    const inside = makeLine({ strokeAlign: StrokeAlign.inside });
    const outside = makeLine({ strokeAlign: StrokeAlign.outside });

    // result
    expect(getLineStrokeOffset(inside, getLineFrame(inside))).toEqual({ x: 0, y: -2 });
    expect(getLineStrokeOffset(outside, getLineFrame(outside))).toEqual({ x: -0, y: 2 });
  });

  it('should keep a centered stroke on the line', () => {
    // mock
    const line = makeLine();

    // result
    expect(getLineStrokeOffset(line, getLineFrame(line))).toEqual({ x: 0, y: 0 });
  });
});
