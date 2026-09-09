// types
import { TAutoLayoutChildSize } from './getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// utils
import { getAutoLayoutChildBaselineOffset } from './getAutoLayoutChildBaselineOffset';

export type TAutoLayoutBaselineExtent = { maxBaseline: number; thickness: number };

export const getAutoLayoutBaselineExtent = (children: TAutoLayoutChildSize[]): TAutoLayoutBaselineExtent => {
  const maxBaseline = children.reduce((max, child) => Math.max(max, getAutoLayoutChildBaselineOffset(child)), 0);
  const thickness = children.reduce((max, child) => Math.max(max, maxBaseline - getAutoLayoutChildBaselineOffset(child) + child.height), 0);

  return { maxBaseline, thickness };
};
