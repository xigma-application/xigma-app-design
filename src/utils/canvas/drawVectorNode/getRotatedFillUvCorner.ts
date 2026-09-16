export type TUvCorner = { u: number; v: number };

export const getRotatedFillUvCorner = (displayU: number, displayV: number, rotation: number): TUvCorner => {
  switch (rotation) {
    case 90:
      return { u: displayV, v: 1 - displayU };
    case 180:
      return { u: 1 - displayU, v: 1 - displayV };
    case 270:
      return { u: 1 - displayV, v: displayU };
    default:
      return { u: displayU, v: displayV };
  }
};
