// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { StrokeJoin } from 'types/design/enums';

export const translationNameSpace = `${parentNameSpace}.offsetVectorToolbar`;
export const OFFSET_VECTOR_DEFAULT_DISTANCE = 20;
export const OFFSET_VECTOR_SLIDER_MAX = 100;

export const OFFSET_VECTOR_INPUT_MAX = 10000;
export const OFFSET_VECTOR_JOINS = [StrokeJoin.miter, StrokeJoin.round] as const;

export const OFFSET_VECTOR_JOIN_ICONS = {
  [StrokeJoin.miter]: 'StrokeJoinMiter',
  [StrokeJoin.round]: 'StrokeJoinRound',
} as const;
