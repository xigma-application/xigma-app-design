// types
import { StrokeMode, StrokeProfile, StrokeSides } from 'types/design/enums';

// utils
import { getRingMode } from '../getRingMode';
import { rect } from './nodeFixture';

describe('getRingMode', () => {
  it('should pick the brush, dynamic, dashed and profile modes in that priority', () => {
    // result
    expect(getRingMode(rect({ strokeMode: StrokeMode.brush, strokeProfile: StrokeProfile.wedge }), [4, 4])).toBe('brush');
    expect(getRingMode(rect({ strokeMode: StrokeMode.dynamic }), [4, 4])).toBe('dynamic');
    expect(getRingMode(rect({ strokeProfile: StrokeProfile.wedge }), [4, 4])).toBe('dashed');
    expect(getRingMode(rect({ strokeProfile: StrokeProfile.wedge }), null)).toBe('profile');
  });

  it('should be uniform without a width, without a profile or for a single side', () => {
    // result
    expect(getRingMode(rect({ strokeMode: StrokeMode.brush, strokeWidth: 0 }), null)).toBe('uniform');
    expect(getRingMode(rect(), null)).toBe('uniform');
    expect(getRingMode(rect({ strokeProfile: StrokeProfile.wedge, strokeSides: StrokeSides.top }), null)).toBe('uniform');
  });
});
