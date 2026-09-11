// types
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export const isGridTrackAffordanceDrawSuppressed = (
  axis: TGridTrackAxis,
  index: number,
  dragState: TGridTrackAffordanceDragState | null,
): boolean => dragState !== null && dragState.hasMoved && dragState.axis === axis && dragState.sourceIndices.includes(index);
