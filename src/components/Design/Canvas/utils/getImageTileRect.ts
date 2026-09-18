// others
import { IMAGE_FILL_DEFAULT_TILE_SCALE } from 'constant/canvas';

// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImageCrop, TImagePaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

export const getImageTileRect = (node: TAppearanceNode, paint: TImagePaint | TVideoPaint): TImageCrop | undefined => {
  const imageSize = imagePaintTextureSizeCache.get(paint.ref);

  if (imageSize) {
    const isSideways = paint.rotation === 90 || paint.rotation === 270;
    const effectiveWidth = isSideways ? imageSize.height : imageSize.width;
    const effectiveHeight = isSideways ? imageSize.width : imageSize.height;
    const scale = paint.scale ?? IMAGE_FILL_DEFAULT_TILE_SCALE;

    return { height: effectiveHeight * scale, rotation: 0, width: effectiveWidth * scale, x: node.x, y: node.y };
  }

  return undefined;
};
