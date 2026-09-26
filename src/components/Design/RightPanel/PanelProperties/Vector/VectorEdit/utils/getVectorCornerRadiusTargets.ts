// types
import { TSelectedVectorPointsEntry } from '../types';

export const getVectorCornerRadiusTargets = (entries: TSelectedVectorPointsEntry[]): TSelectedVectorPointsEntry[] =>
  entries.some(({ pointIds }) => pointIds.length > 0)
    ? entries.filter(({ pointIds }) => pointIds.length > 0)
    : entries.map((entry) => ({ ...entry, pointIds: [] }));
