// types
import { TDraftRect } from 'types/canvas';
import { TSolidPaint } from 'types/design/paint/types';

// utils
import { formatSvgNumber } from './formatSvgNumber';

export const drawSvgPageBackground = (elements: string[], bounds: TDraftRect, backgroundPaint: TSolidPaint): void => {
  const opacity = backgroundPaint.opacity / 100;
  const opacityAttribute = opacity < 1 ? ` fill-opacity="${formatSvgNumber(opacity)}"` : '';

  elements.push(
    `<rect width="${formatSvgNumber(bounds.width)}" height="${formatSvgNumber(bounds.height)}" fill="${backgroundPaint.color}"${opacityAttribute}/>`,
  );
};
