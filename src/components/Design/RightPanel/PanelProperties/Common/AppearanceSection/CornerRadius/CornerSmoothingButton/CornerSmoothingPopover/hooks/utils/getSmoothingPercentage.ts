// types
import { TAppearanceNode } from '../../../../../types';

// utils
import { clampSmoothing } from './clampSmoothing';

export const getSmoothingPercentage = (node: TAppearanceNode | undefined): number => clampSmoothing((node?.cornerSmoothing ?? 0) * 100);
