// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TGridTrackSelection } from 'types/design/canvas/types';

const EMPTY_INDICES: number[] = [];

export const getGridTrackRawIndices = (
  panelSelection: TGridTrackSelection | null,
  axis: TGridTrackAxis,
  frameId: string | null,
  isSuppressed: boolean,
  localIndices: number[],
): number[] => {
  const matchesPanelSelection = panelSelection?.frameId === frameId && panelSelection.axis === axis;
  const panelSelectionBelongsToOtherAxis = panelSelection?.frameId === frameId && panelSelection.axis !== axis;

  switch (true) {
    case matchesPanelSelection:
      return panelSelection.indices;
    case isSuppressed || panelSelectionBelongsToOtherAxis:
      return EMPTY_INDICES;
    default:
      return localIndices;
  }
};
