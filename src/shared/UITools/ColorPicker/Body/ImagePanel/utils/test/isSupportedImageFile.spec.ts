// utils
import { isSupportedImageFile } from '../isSupportedImageFile';

const createFile = (type: string): File => new File(['content'], 'file', { type });

describe('isSupportedImageFile', () => {
  it('should accept a PNG file', () => {
    expect(isSupportedImageFile(createFile('image/png'))).toBe(true);
  });

  it('should accept a JPEG file', () => {
    expect(isSupportedImageFile(createFile('image/jpeg'))).toBe(true);
  });

  it('should reject an SVG file', () => {
    expect(isSupportedImageFile(createFile('image/svg+xml'))).toBe(false);
  });

  it('should reject a video file', () => {
    expect(isSupportedImageFile(createFile('video/mp4'))).toBe(false);
  });

  it('should reject a non-media file', () => {
    expect(isSupportedImageFile(createFile('application/pdf'))).toBe(false);
  });
});
