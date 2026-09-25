// utils
import { getFileExtension } from '../getFileExtension';

describe('getFileExtension', () => {
  it('should return the lower-cased extension after the last dot', () => {
    // result
    expect(getFileExtension('my.clip.MP4')).toBe('.mp4');
  });

  it('should return an empty string for a name without a dot', () => {
    // result
    expect(getFileExtension('clip')).toBe('');
  });
});
