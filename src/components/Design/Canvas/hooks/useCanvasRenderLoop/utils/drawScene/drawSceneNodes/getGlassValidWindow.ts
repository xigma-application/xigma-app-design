// types
import { TGlassCacheEntry, TScissorRect } from './types';

export const getGlassValidWindow = (
  rect: TScissorRect,
): Pick<TGlassCacheEntry, 'localX' | 'localY' | 'validBottom' | 'validLeft' | 'validRight' | 'validTop'> => {
  const margin = rect.margin ?? 0;
  const localX = rect.x - (rect.originX ?? rect.x);
  const localY = rect.y - (rect.originY ?? rect.y);
  const rawWidth = rect.rawWidth ?? rect.width;
  const rawHeight = rect.rawHeight ?? rect.height;

  return {
    localX,
    localY,
    validBottom: localY + (localY > 0 ? margin : 0),
    validLeft: localX + (localX > 0 ? margin : 0),
    validRight: localX + rect.width - (localX + rect.width < rawWidth ? margin : 0),
    validTop: localY + rect.height - (localY + rect.height < rawHeight ? margin : 0),
  };
};
