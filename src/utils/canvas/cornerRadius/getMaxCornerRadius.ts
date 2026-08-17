// types
import { TDraftRect } from 'types/canvas';

export const getMaxCornerRadius = (bounds: TDraftRect): number => Math.min(bounds.width, bounds.height) / 2;
