// types
import { StrokeMode, StrokeProfile, StrokeSides } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TRingMode } from './types';

export const getRingMode = (node: TFrameNode | TRectangleNode, dashPattern: number[] | null): TRingMode => {
  const hasWidth = Boolean(node.strokeWidth);
  const hasProfile =
    (node.strokeProfile ?? StrokeProfile.uniform) !== StrokeProfile.uniform && (node.strokeSides ?? StrokeSides.all) === StrokeSides.all;

  switch (true) {
    case hasWidth && node.strokeMode === StrokeMode.brush:
      return 'brush';
    case hasWidth && node.strokeMode === StrokeMode.dynamic:
      return 'dynamic';
    case hasWidth && dashPattern !== null:
      return 'dashed';
    case hasWidth && hasProfile:
      return 'profile';
    default:
      return 'uniform';
  }
};
