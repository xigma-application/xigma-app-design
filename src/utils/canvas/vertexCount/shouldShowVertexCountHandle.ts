// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { isBoundsLargeEnoughForHandles } from '../isBoundsLargeEnoughForHandles';

export const shouldShowVertexCountHandle = (bounds: TDraftRect, viewport: TViewport): boolean =>
  isBoundsLargeEnoughForHandles(bounds, viewport);
