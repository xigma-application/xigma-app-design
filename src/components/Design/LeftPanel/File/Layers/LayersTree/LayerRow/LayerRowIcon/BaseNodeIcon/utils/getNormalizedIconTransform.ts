import { CSSProperties } from 'react';

// others
import { BASE_NODE_ICON_MAX_CONTENT_SIZE } from '../../constants';

export type TIconRect = { height: number; width: number; x: number; y: number };

export const getNormalizedIconTransform = (bbox: TIconRect, viewBox: TIconRect, size: number): CSSProperties | undefined => {
  if (bbox.width <= 0 || bbox.height <= 0) {
    return undefined;
  }

  const pxPerUnitX = size / viewBox.width;
  const pxPerUnitY = size / viewBox.height;
  const contentWidth = bbox.width * pxPerUnitX;
  const contentHeight = bbox.height * pxPerUnitY;
  const scale = BASE_NODE_ICON_MAX_CONTENT_SIZE / Math.max(contentWidth, contentHeight);
  const bboxCenterX = (bbox.x - viewBox.x + bbox.width / 2) * pxPerUnitX;
  const bboxCenterY = (bbox.y - viewBox.y + bbox.height / 2) * pxPerUnitY;
  const boxCenter = size / 2;

  return {
    transform: `translate(${boxCenter - bboxCenterX}px, ${boxCenter - bboxCenterY}px) scale(${scale})`,
    transformOrigin: `${bboxCenterX}px ${bboxCenterY}px`,
  };
};
