type TRgbPrimeChannels = { bPrime: number; gPrime: number; rPrime: number };

export const getRgbPrimeChannels = (hue: number, c: number, x: number): TRgbPrimeChannels => {
  const sector = Math.floor((hue % 360) / 60) % 6;

  switch (sector) {
    case 0:
      return { bPrime: 0, gPrime: x, rPrime: c };
    case 1:
      return { bPrime: 0, gPrime: c, rPrime: x };
    case 2:
      return { bPrime: x, gPrime: c, rPrime: 0 };
    case 3:
      return { bPrime: c, gPrime: x, rPrime: 0 };
    case 4:
      return { bPrime: c, gPrime: 0, rPrime: x };
    default:
      return { bPrime: x, gPrime: 0, rPrime: c };
  }
};
