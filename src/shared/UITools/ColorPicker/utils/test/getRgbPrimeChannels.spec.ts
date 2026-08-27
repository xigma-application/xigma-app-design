// utils
import { getRgbPrimeChannels } from '../getRgbPrimeChannels';

describe('getRgbPrimeChannels', () => {
  it('should put chroma on the red channel in the 0-60 sector', () => {
    expect(getRgbPrimeChannels(0, 1, 0.5)).toEqual({ bPrime: 0, gPrime: 0.5, rPrime: 1 });
  });

  it('should put chroma on the green channel in the 60-120 sector', () => {
    expect(getRgbPrimeChannels(90, 1, 0.5)).toEqual({ bPrime: 0, gPrime: 1, rPrime: 0.5 });
  });

  it('should put chroma on the green channel in the 120-180 sector', () => {
    expect(getRgbPrimeChannels(150, 1, 0.5)).toEqual({ bPrime: 0.5, gPrime: 1, rPrime: 0 });
  });

  it('should put chroma on the red channel in the 300-360 sector', () => {
    expect(getRgbPrimeChannels(330, 1, 0.5)).toEqual({ bPrime: 0.5, gPrime: 0, rPrime: 1 });
  });

  it('should wrap a hue of 360 back to the first sector', () => {
    expect(getRgbPrimeChannels(360, 1, 0.5)).toEqual({ bPrime: 0, gPrime: 0.5, rPrime: 1 });
  });
});
