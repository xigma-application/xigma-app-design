const hashLoopKey = (loopKey: string): number => {
  let hash = 0;

  for (let index = 0; index < loopKey.length; index += 1) {
    hash = (hash * 31 + loopKey.charCodeAt(index)) | 0;
  }

  return hash;
};

const toHexChannel = (hue: number, saturationFraction: number, lightnessFraction: number, offset: number): string => {
  const chroma = saturationFraction * Math.min(lightnessFraction, 1 - lightnessFraction);
  const angle = (offset + hue / 30) % 12;
  const value = lightnessFraction - chroma * Math.max(-1, Math.min(angle - 3, 9 - angle, 1));
  const clamped = Math.min(255, Math.max(0, Math.round(value * 255)));

  return clamped.toString(16).padStart(2, '0');
};

export const getVectorFillColorForLoopKey = (loopKey: string): string => {
  const hue = Math.abs(hashLoopKey(loopKey)) % 360;

  return `#${toHexChannel(hue, 0.7, 0.55, 0)}${toHexChannel(hue, 0.7, 0.55, 8)}${toHexChannel(hue, 0.7, 0.55, 4)}`;
};
