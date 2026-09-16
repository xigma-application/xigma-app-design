// utils
import { getFileExtension } from '../getFileExtension';

describe('getFileExtension', () => {
  it('should return the lowercased extension including the dot', () => {
    expect(getFileExtension('photo.SVG')).toBe('.svg');
  });

  it('should return the extension for a normal lowercase file name', () => {
    expect(getFileExtension('photo.png')).toBe('.png');
  });

  it('should use the last dot for a file name with multiple dots', () => {
    expect(getFileExtension('my.holiday.photo.jpeg')).toBe('.jpeg');
  });

  it('should return an empty string when there is no extension', () => {
    expect(getFileExtension('photo')).toBe('');
  });
});
