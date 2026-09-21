// types
import { TSelectionColorOccurrence } from '../types';

// utils
import { getSelectionColorOccurrenceIdentity } from './getSelectionColorOccurrenceIdentity';

export const getSelectionColorGroupKey = (occurrences: TSelectionColorOccurrence[]): string =>
  occurrences.map(getSelectionColorOccurrenceIdentity).sort().join(',');
