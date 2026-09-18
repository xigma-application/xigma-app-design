// utils
import { formatElapsedTime } from '../formatElapsedTime';

describe('formatElapsedTime', () => {
  it('should show 00:00 at playback start', () => {
    // result
    expect(formatElapsedTime(0)).toBe('00:00');
  });

  it('should count up as currentTime advances', () => {
    // result
    expect(formatElapsedTime(5)).toBe('00:05');
    expect(formatElapsedTime(70)).toBe('01:10');
  });

  it('should pad single-digit minutes and seconds with a leading zero', () => {
    // result
    expect(formatElapsedTime(65)).toBe('01:05');
  });

  it('should fall back to 00:00 for a not-yet-known (NaN) currentTime', () => {
    // result
    expect(formatElapsedTime(NaN)).toBe('00:00');
  });

  it('should format minutes at or beyond ten without truncating the digit', () => {
    // result
    expect(formatElapsedTime(725)).toBe('12:05');
  });
});
