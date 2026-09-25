// types
import { StrokeMode, StrokeProfile } from 'types/design/enums';

// utils
import { getLineStrokeMode } from '../getLineStrokeMode';
import { makeLine } from './fixtures';

describe('getLineStrokeMode', () => {
  it('should pick brush and dynamic from the stroke mode first', () => {
    // result
    expect(getLineStrokeMode(makeLine({ strokeMode: StrokeMode.brush }), [4, 4])).toBe('brush');
    expect(getLineStrokeMode(makeLine({ strokeMode: StrokeMode.dynamic }), [4, 4])).toBe('dynamic');
  });

  it('should then pick dashed, a width profile, and otherwise a uniform stroke', () => {
    // result
    expect(getLineStrokeMode(makeLine({ strokeProfile: StrokeProfile.taper }), [4, 4])).toBe('dashed');
    expect(getLineStrokeMode(makeLine({ strokeProfile: StrokeProfile.taper }), null)).toBe('profile');
    expect(getLineStrokeMode(makeLine(), null)).toBe('uniform');
  });
});
