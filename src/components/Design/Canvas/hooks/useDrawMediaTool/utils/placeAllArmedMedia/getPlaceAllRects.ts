// others
import { MEDIA_PLACE_ALL_CASCADE_OFFSET_PX } from '../../../../constants';

// types
import { TArmedMedia } from '../loadArmedMedia';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getCenteredMediaRect } from '../handlePointerUp/utils/getCenteredMediaRect';
import { roundRect } from 'utils/math/roundRect';

export type TPlacedMedia = { media: TArmedMedia; rect: TDraftRect };

export const getPlaceAllRects = (mediaList: TArmedMedia[], center: TPoint): TPlacedMedia[] => {
  const [largest, ...rest] = [...mediaList].sort((a, b) => b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight);

  if (largest) {
    const placed: TPlacedMedia[] = [
      { media: largest, rect: roundRect(getCenteredMediaRect(center, largest.naturalWidth, largest.naturalHeight)) },
    ];

    rest.forEach((media) => {
      const previousRect = placed[placed.length - 1].rect;

      placed.push({
        media,
        rect: roundRect({
          height: media.naturalHeight,
          width: media.naturalWidth,
          x: previousRect.x - MEDIA_PLACE_ALL_CASCADE_OFFSET_PX,
          y: previousRect.y - MEDIA_PLACE_ALL_CASCADE_OFFSET_PX,
        }),
      });
    });

    return placed;
  }

  return [];
};
