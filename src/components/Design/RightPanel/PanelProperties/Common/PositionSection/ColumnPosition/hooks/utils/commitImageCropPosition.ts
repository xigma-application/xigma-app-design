// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TImageCrop } from 'types/design/paint/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';

type TParent = Parameters<typeof getNodeAbsoluteFromParentPosition>[1];

export const commitImageCropPosition = (
  dispatch: AppDispatch,
  imageCrop: TSelectedImageCrop,
  parent: TParent | undefined,
  nextX: number,
  nextY: number,
): void => {
  const absolute = parent ? getNodeAbsoluteFromParentPosition({ x: nextX, y: nextY }, parent) : { x: nextX, y: nextY };
  const crop: TImageCrop = { ...imageCrop.crop, x: Math.round(absolute.x), y: Math.round(absolute.y) };
  const fills = imageCrop.node.fills.map((fill, index) => (index === imageCrop.paintIndex ? { ...imageCrop.paint, crop } : fill));

  dispatch(updateNode({ changes: { fills }, id: imageCrop.node.id }));
};
