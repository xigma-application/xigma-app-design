// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImageCrop, TImagePaint } from 'types/design/paint/types';

export const getImageCropRect = (node: TAppearanceNode, paint: TImagePaint): TImageCrop =>
  paint.crop ?? { height: node.height, rotation: node.rotation, width: node.width, x: node.x, y: node.y };
