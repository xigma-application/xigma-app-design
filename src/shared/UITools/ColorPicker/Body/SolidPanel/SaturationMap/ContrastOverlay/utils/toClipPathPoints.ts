// types
import { TContrastCurvePoint } from '../../../ContrastChecker/types';

export const toClipPathPoints = (points: TContrastCurvePoint[]): string => points.map(({ s, v }) => `${s}% ${100 - v}%`).join(', ');
