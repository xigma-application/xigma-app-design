// @xigma
import { BRUSH_IMAGES_DIRECTORY } from '@xigma/utils';

const BRUSH_IMAGES = import.meta.glob<string>('/node_modules/@xigma/assets/images/brushes/*/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
});

export const getBrushImageUrl = (imageFile: string): string =>
  BRUSH_IMAGES[`/node_modules/@xigma/assets/${BRUSH_IMAGES_DIRECTORY}/${imageFile}`] ?? '';
