// types
import { TStarNode } from 'types/design/types';

export const getStarRatioPercentage = (node: TStarNode): number => Math.round(node.ratio * 1000) / 10;
