// types
import { TGradientStop } from 'types/design/paint/types';

export type TEditableGradientStop = TGradientStop & { id: string };

export type TGradientType = 'gradient-angular' | 'gradient-diamond' | 'gradient-linear' | 'gradient-radial';

export type TGradientPanelChange = { angle: number; stops: TEditableGradientStop[]; type: TGradientType };
