import { Dispatch, SetStateAction } from 'react';

// others
import { ANGLE_STEP } from '../../../constants';

// types
import { TEditableGradientStop, TGradientPanelChange, TGradientType } from '../../../types';
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export type TGradientPoints = { end: TPoint; start: TPoint };

const GRADIENT_CENTER: TPoint = { x: 0.5, y: 0.5 };

export const useRotateGradient = (
  stops: TEditableGradientStop[],
  type: TGradientType,
  angle: number,
  setAngle: Dispatch<SetStateAction<number>>,
  points: TGradientPoints | null,
  setPoints: Dispatch<SetStateAction<TGradientPoints | null>>,
  onChange?: TFunc<[TGradientPanelChange]>,
): TFunc => {
  return (): void => {
    if (points) {
      const nextPoints: TGradientPoints = {
        end: rotatePoint(points.end, GRADIENT_CENTER, ANGLE_STEP),
        start: rotatePoint(points.start, GRADIENT_CENTER, ANGLE_STEP),
      };

      setPoints(nextPoints);
      onChange?.({ angle, end: nextPoints.end, start: nextPoints.start, stops, type });
    } else {
      const nextAngle = (angle + ANGLE_STEP) % 360;

      setAngle(nextAngle);
      onChange?.({ angle: nextAngle, stops, type });
    }
  };
};
