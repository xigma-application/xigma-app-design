// types
import { ContrastCategory, ContrastLevel } from './enums';

export type TContrastCurvePoint = { s: number; v: number };

export type TContrastBoundary = { passSide: 'darker' | 'lighter'; points: TContrastCurvePoint[] };

export type TContrastCheckerState = { category: ContrastCategory; isActive: boolean; level: ContrastLevel };
