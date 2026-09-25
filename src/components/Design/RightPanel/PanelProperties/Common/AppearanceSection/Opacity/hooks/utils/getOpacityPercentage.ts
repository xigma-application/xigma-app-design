// types
import { TStyledNode } from '../../../types';

// utils
import { clampOpacity } from './clampOpacity';

export const getOpacityPercentage = (node: TStyledNode | undefined): number => clampOpacity((node?.opacity ?? 1) * 100);
