// types
import { TDraftRect } from 'types/canvas';

// utils
import { formatSvgNumber } from '../formatSvgNumber';

export const getSvgBlobMarkup = (bounds: TDraftRect, defs: string[], elements: string[]): string => {
  const width = formatSvgNumber(bounds.width);
  const height = formatSvgNumber(bounds.height);
  const defsMarkup = defs.length > 0 ? `<defs>${defs.join('')}</defs>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defsMarkup}${elements.join('')}</svg>`;
};
