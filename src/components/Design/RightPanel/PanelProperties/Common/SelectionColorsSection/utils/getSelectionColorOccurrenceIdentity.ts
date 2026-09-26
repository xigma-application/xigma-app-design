// types
import { TSelectionColorOccurrence } from '../types';

export const getSelectionColorOccurrenceIdentity = (occurrence: TSelectionColorOccurrence): string =>
  [occurrence.nodeId, occurrence.property, occurrence.faceKey, occurrence.index].filter((part) => part !== undefined).join(':');
