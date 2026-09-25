// types
import { TFillRule, TPoint } from 'types/canvas';

export type TLinePoints = { x1: number; x2: number; y1: number; y2: number };

export type TLineBox = { height: number; rotation: number; width: number; x: number; y: number };

export type TLineFrame = { end: TPoint; halfWidth: number; length: number; normal: TPoint; start: TPoint; unit: TPoint };

export type TLineStrokeShape = { fillRule: TFillRule; polygons: TPoint[][] };
