// utils
import { flattenPixelsToOpaqueWhite } from '../flattenPixelsToOpaqueWhite';

describe('flattenPixelsToOpaqueWhite', () => {
  it('should leave a fully opaque pixel unchanged', () => {
    expect(flattenPixelsToOpaqueWhite(new Uint8Array([10, 20, 30, 255]))).toEqual(new Uint8Array([10, 20, 30, 255]));
  });

  it('should blend a fully transparent pixel to opaque white', () => {
    expect(flattenPixelsToOpaqueWhite(new Uint8Array([10, 20, 30, 0]))).toEqual(new Uint8Array([255, 255, 255, 255]));
  });

  it('should blend a half-transparent pixel toward white', () => {
    expect(flattenPixelsToOpaqueWhite(new Uint8Array([0, 0, 0, 128]))).toEqual(new Uint8Array([127, 127, 127, 255]));
  });
});
