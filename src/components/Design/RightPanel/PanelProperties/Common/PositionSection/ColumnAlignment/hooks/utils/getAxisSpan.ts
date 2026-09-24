// types
import { TDistributeAxis } from '../../types';
import { TDraftRect } from 'types/canvas';

export const getAxisSpan = (rect: TDraftRect, axis: TDistributeAxis): { size: number; start: number } =>
  axis === 'horizontal' ? { size: rect.width, start: rect.x } : { size: rect.height, start: rect.y };
