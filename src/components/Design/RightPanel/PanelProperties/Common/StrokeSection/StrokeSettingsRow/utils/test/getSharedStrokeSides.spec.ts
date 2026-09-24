// types
import { StrokeSides } from 'types/design/enums';

// utils
import { getSharedStrokeSides } from '../getSharedStrokeSides';

describe('getSharedStrokeSides', () => {
  it('should return All for an empty selection and the shared value when every node agrees', () => {
    // result
    expect(getSharedStrokeSides([])).toBe(StrokeSides.all);
    expect(getSharedStrokeSides([StrokeSides.top, StrokeSides.top])).toBe(StrokeSides.top);
  });

  it('should treat a mix of All and Custom as Custom', () => {
    // result
    expect(getSharedStrokeSides([StrokeSides.all, StrokeSides.custom])).toBe(StrokeSides.custom);
  });

  it('should be mixed as soon as one node has a single side, whatever the others have', () => {
    // result
    expect(getSharedStrokeSides([StrokeSides.all, StrokeSides.top])).toBeUndefined();
    expect(getSharedStrokeSides([StrokeSides.custom, StrokeSides.custom, StrokeSides.left])).toBeUndefined();
  });
});
