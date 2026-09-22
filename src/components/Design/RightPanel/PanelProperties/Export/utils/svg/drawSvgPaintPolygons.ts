// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint, TImagePaint, TPaint, TSolidPaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { drawSvgAngularGradientPolygons } from './drawSvgAngularGradientPolygons';
import { drawSvgDiamondGradientPolygons } from './drawSvgDiamondGradientPolygons';
import { drawSvgGradientPolygons } from './drawSvgGradientPolygons';
import { drawSvgImagePaint, TSvgImageBoxGeometry } from './drawSvgImagePaint';
import { drawSvgPolygons } from './drawSvgPolygons';
import { getFillsInPaintOrder } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getFillsInPaintOrder';
import { getScaledFillPaints } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getScaledFillPaints';

const VECTOR_PAINT_TYPES: TPaint['type'][] = [
  'solid',
  'gradient-linear',
  'gradient-radial',
  'gradient-angular',
  'gradient-diamond',
  'image',
  'video',
];

const isVisibleVectorPaint = (paint: TPaint): paint is TSolidPaint | TGradientPaint | TImagePaint | TVideoPaint =>
  paint.visible !== false && VECTOR_PAINT_TYPES.includes(paint.type);

export const drawSvgPaintPolygons = async (
  elements: string[],
  defs: string[],
  paints: TPaint[],
  polygons: TPoint[][],
  opacity: number,
  bounds: TDraftRect,
  nodeBounds: TDraftRect | null = null,
  boxGeometry: TSvgImageBoxGeometry | null = null,
): Promise<void> => {
  const visiblePaints = getFillsInPaintOrder(getScaledFillPaints(paints, opacity)).filter(isVisibleVectorPaint);

  for (const paint of visiblePaints) {
    switch (paint.type) {
      case 'solid':
        drawSvgPolygons(elements, polygons, paint.color, paint.opacity / 100, bounds);
        break;
      case 'gradient-linear':
      case 'gradient-radial':
        drawSvgGradientPolygons(elements, defs, paint, polygons, paint.opacity / 100, bounds, nodeBounds);
        break;
      case 'gradient-angular':
        drawSvgAngularGradientPolygons(elements, defs, paint, polygons, paint.opacity / 100, bounds, nodeBounds);
        break;
      case 'gradient-diamond':
        drawSvgDiamondGradientPolygons(elements, defs, paint, polygons, paint.opacity / 100, bounds, nodeBounds);
        break;
      default:
        if (boxGeometry) {
          await drawSvgImagePaint(elements, defs, paint as TImagePaint | TVideoPaint, polygons, paint.opacity / 100, bounds, boxGeometry);
        }
        break;
    }
  }
};
