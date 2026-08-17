// others
import { MIN_ELEMENT_SCREEN_SIZE_FOR_RADIUS_HANDLES_PX } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

export const shouldShowCornerRadiusHandles = (bounds: TDraftRect, viewport: TViewport): boolean =>
  Math.min(bounds.width, bounds.height) * viewport.zoom >= MIN_ELEMENT_SCREEN_SIZE_FOR_RADIUS_HANDLES_PX;
