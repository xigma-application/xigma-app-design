export const getThumbOffset = (fraction: number, radiusPx: number): string =>
  `calc(${radiusPx}px + ${fraction} * (100% - ${radiusPx * 2}px))`;
