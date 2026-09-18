// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeBounds } from './getNodeBounds';
import { getPaddedRect } from 'utils/design/stroke/getPaddedRect';
import { getStrokePaddings } from 'utils/design/stroke/getStrokePaddings';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getSelectionOutlineDrawRect = (node: TSceneNode): TDraftRect => {
  const bounds = getNodeBounds(node);
  const padded = getPaddedRect(bounds, getStrokePaddings(node));

  if (node.type !== NodeType.line && node.rotation !== 0) {
    const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const paddedCenter = rotatePoint({ x: padded.x + padded.width / 2, y: padded.y + padded.height / 2 }, center, node.rotation);

    return { height: padded.height, width: padded.width, x: paddedCenter.x - padded.width / 2, y: paddedCenter.y - padded.height / 2 };
  }

  return padded;
};
