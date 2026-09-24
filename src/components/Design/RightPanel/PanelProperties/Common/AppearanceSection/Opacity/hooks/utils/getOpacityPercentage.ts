// types
import { TAppearanceNode } from '../../../types';

// utils
import { clampOpacity } from './clampOpacity';

export const getOpacityPercentage = (node: TAppearanceNode | undefined): number => clampOpacity((node?.opacity ?? 1) * 100);
