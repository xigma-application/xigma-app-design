// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TImageCrop } from 'types/design/paint/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { getPaintReplaceChange } from 'utils/design/paint/getPaintReplaceChange';
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
  const change = getPaintReplaceChange(imageCrop.node, imageCrop.property, imageCrop.paintIndex, { ...imageCrop.paint, crop });

  dispatch(updateNode({ changes: change, id: imageCrop.node.id }));
};
