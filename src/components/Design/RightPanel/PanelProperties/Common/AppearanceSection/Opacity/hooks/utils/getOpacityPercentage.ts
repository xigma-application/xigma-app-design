// types
import { TBaseNode } from 'types/design/types';

// utils
import { clampOpacity } from './clampOpacity';

export const getOpacityPercentage = (node: Pick<TBaseNode, 'opacity'> | undefined): number => clampOpacity((node?.opacity ?? 1) * 100);
