// utils
import { getResizeAnchorPoint } from '../getResizeAnchorPoint';

const ORIGIN = { height: 100, width: 100, x: 0, y: 0 };

describe('getResizeAnchorPoint', () => {
  it('should anchor to the opposite corner for each corner handle', () => {
    // result
    expect(getResizeAnchorPoint('nw', ORIGIN)).toEqual({ x: 100, y: 100 });
    expect(getResizeAnchorPoint('ne', ORIGIN)).toEqual({ x: 0, y: 100 });
    expect(getResizeAnchorPoint('se', ORIGIN)).toEqual({ x: 0, y: 0 });
    expect(getResizeAnchorPoint('sw', ORIGIN)).toEqual({ x: 100, y: 0 });
  });

  it('should return null for edge handles, since Shift-lock only applies to corners', () => {
    // result
    expect(getResizeAnchorPoint('n', ORIGIN)).toBeNull();
    expect(getResizeAnchorPoint('s', ORIGIN)).toBeNull();
    expect(getResizeAnchorPoint('e', ORIGIN)).toBeNull();
    expect(getResizeAnchorPoint('w', ORIGIN)).toBeNull();
  });
});
