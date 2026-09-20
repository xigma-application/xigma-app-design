// types
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TMaskRenderer } from './types';

// utils
import { getIsolatedSubtree } from './getIsolatedSubtree';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { getRotatedCorners } from './getRotatedCorners';
import { hasRealBlendMode } from './hasRealBlendMode';

const SAFETY_PX = 1;

const hasVisibleEffect = (node: TSceneNode): boolean => 'effects' in node && (node.effects ?? []).some((effect) => effect.visible !== false);

const getChildBounds = (child: TSceneNode): TDraftRect => {
  const strokeWidth = 'strokeWidth' in child ? (child.strokeWidth ?? 0) : 0;
  const corners = getRotatedCorners(getNodeBounds(child), 'rotation' in child ? child.rotation : 0);
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  const x = Math.min(...xs) - strokeWidth - SAFETY_PX;
  const y = Math.min(...ys) - strokeWidth - SAFETY_PX;

  return { height: Math.max(...ys) + strokeWidth + SAFETY_PX - y, width: Math.max(...xs) + strokeWidth + SAFETY_PX - x, x, y };
};

const isCornerClear = (pointX: number, pointY: number, centerX: number, centerY: number, radius: number, towardX: number, towardY: number): boolean =>
  radius <= 0 ||
  !(towardX * (pointX - centerX) > 0 && towardY * (pointY - centerY) > 0) ||
  Math.hypot(pointX - centerX, pointY - centerY) <= radius;

const isInsideFrame = (frame: TFrameNode, box: TDraftRect): boolean => {
  const radius = frame.cornerRadius ?? 0;
  const left = frame.x;
  const top = frame.y;
  const right = frame.x + frame.width;
  const bottom = frame.y + frame.height;
  const topLeft = frame.cornerRadiusTopLeft ?? radius;
  const topRight = frame.cornerRadiusTopRight ?? radius;
  const bottomLeft = frame.cornerRadiusBottomLeft ?? radius;
  const bottomRight = frame.cornerRadiusBottomRight ?? radius;

  return (
    box.x >= left &&
    box.y >= top &&
    box.x + box.width <= right &&
    box.y + box.height <= bottom &&
    isCornerClear(box.x, box.y, left + topLeft, top + topLeft, topLeft, -1, -1) &&
    isCornerClear(box.x + box.width, box.y, right - topRight, top + topRight, topRight, 1, -1) &&
    isCornerClear(box.x, box.y + box.height, left + bottomLeft, bottom - bottomLeft, bottomLeft, -1, 1) &&
    isCornerClear(box.x + box.width, box.y + box.height, right - bottomRight, bottom - bottomRight, bottomRight, 1, 1)
  );
};

export const canSkipFrameClip = (renderer: TMaskRenderer, frame: TFrameNode): boolean => {
  const subtree = frame.rotation === 0 ? getIsolatedSubtree(renderer, frame) : null;

  return (
    subtree !== null &&
    subtree.every((child) => !hasVisibleEffect(child) && !hasRealBlendMode(child, renderer.refs) && isInsideFrame(frame, getChildBounds(child)))
  );
};
