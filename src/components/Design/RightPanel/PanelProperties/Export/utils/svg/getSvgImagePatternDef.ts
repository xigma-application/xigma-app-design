// utils
import { formatSvgNumber } from './formatSvgNumber';

export const getSvgImagePatternDef = (
  id: string,
  dataUrl: string,
  tileWidth: number,
  tileHeight: number,
  patternTransformValue: string,
): string => {
  const transformAttribute = patternTransformValue ? ` patternTransform="${patternTransformValue}"` : '';
  const width = formatSvgNumber(tileWidth);
  const height = formatSvgNumber(tileHeight);

  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${width}" height="${height}"${transformAttribute}><image href="${dataUrl}" width="${width}" height="${height}"/></pattern>`;
};
