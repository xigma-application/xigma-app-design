// types
import { StrokeBrushDirection } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// others
import {
  STROKE_BRUSH_ANGULAR_JITTER_DEFAULT,
  STROKE_BRUSH_DEFAULT,
  STROKE_BRUSH_GAP_DEFAULT,
  STROKE_BRUSH_ROTATION_DEFAULT,
  STROKE_BRUSH_SIZE_JITTER_DEFAULT,
  STROKE_BRUSH_WIGGLE_DEFAULT,
} from 'constant/strokeBrush';

export type TStrokeBrushValues = {
  angularJitter: number;
  brush: string;
  direction: StrokeBrushDirection;
  gap: number;
  rotation: number;
  sizeJitter: number;
  wiggle: number;
};

export type TStrokeBrushSource = Pick<
  TFrameNode | TRectangleNode,
  | 'strokeBrush'
  | 'strokeBrushAngularJitter'
  | 'strokeBrushDirection'
  | 'strokeBrushGap'
  | 'strokeBrushRotation'
  | 'strokeBrushSizeJitter'
  | 'strokeBrushWiggle'
>;

export const getStrokeBrushValues = (node: TStrokeBrushSource | undefined): TStrokeBrushValues => ({
  angularJitter: node?.strokeBrushAngularJitter ?? STROKE_BRUSH_ANGULAR_JITTER_DEFAULT,
  brush: node?.strokeBrush ?? STROKE_BRUSH_DEFAULT,
  direction: node?.strokeBrushDirection ?? StrokeBrushDirection.right,
  gap: node?.strokeBrushGap ?? STROKE_BRUSH_GAP_DEFAULT,
  rotation: node?.strokeBrushRotation ?? STROKE_BRUSH_ROTATION_DEFAULT,
  sizeJitter: node?.strokeBrushSizeJitter ?? STROKE_BRUSH_SIZE_JITTER_DEFAULT,
  wiggle: node?.strokeBrushWiggle ?? STROKE_BRUSH_WIGGLE_DEFAULT,
});
