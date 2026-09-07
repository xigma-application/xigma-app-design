// types
import { TDimensionHintGuides } from './types';

export const mergeDimensionHintGuides = (...parts: TDimensionHintGuides[]): TDimensionHintGuides => ({
  labels: parts.flatMap((part) => part.labels),
  lines: parts.flatMap((part) => part.lines),
});
