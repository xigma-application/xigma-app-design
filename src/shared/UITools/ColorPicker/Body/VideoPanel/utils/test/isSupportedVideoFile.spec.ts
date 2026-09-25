// utils
import { isSupportedVideoFile } from '../isSupportedVideoFile';

describe('isSupportedVideoFile', () => {
  it('should accept any video mime type and reject anything else', () => {
    // result
    expect(isSupportedVideoFile(new File([''], 'a.mp4', { type: 'video/mp4' }))).toBe(true);
    expect(isSupportedVideoFile(new File([''], 'a.png', { type: 'image/png' }))).toBe(false);
  });
});
