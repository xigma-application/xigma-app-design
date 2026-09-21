// types
import { TSelectionColorOccurrence } from '../types';

export const getSelectionColorOccurrenceIdentity = (occurrence: TSelectionColorOccurrence): string =>
  `${occurrence.nodeId}:${occurrence.property}:${occurrence.index}`;
