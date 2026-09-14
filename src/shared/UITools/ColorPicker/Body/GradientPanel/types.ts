// types
import { TPoint } from 'types/canvas';
import { TGradientStop } from 'types/design/paint/types';

export type TEditableGradientStop = TGradientStop & { id: string };
export type TGradientType = 'gradient-angular' | 'gradient-diamond' | 'gradient-linear' | 'gradient-radial';
export type TGradientPanelChange = { angle: number; end?: TPoint; start?: TPoint; stops: TEditableGradientStop[]; type: TGradientType };
export type TInitialGradient = { end: TPoint; start: TPoint; stops: TGradientStop[]; type: TGradientType };
