// types
import { TDraftRect } from 'types/canvas';
import { TEdges } from './types';

export const getEdges = (rect: TDraftRect): TEdges => ({
  bottom: rect.y + rect.height,
  left: rect.x,
  right: rect.x + rect.width,
  top: rect.y,
});
