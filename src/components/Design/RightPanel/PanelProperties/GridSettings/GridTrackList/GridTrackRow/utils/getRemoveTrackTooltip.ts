import { TFunction } from 'i18next';

// others
import { translationNameSpace } from '../../../constants';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TGridTrackViewModel } from '../../../hooks/types';

export const getRemoveTrackTooltip = (
  t: TFunction,
  axis: TGridTrackAxis,
  track: TGridTrackViewModel,
  trackCount: number,
  isSelected: boolean,
  selectedCount: number,
): string => {
  const axisKey = axis === 'column' ? 'Column' : 'Row';
  const isBulkRemove = isSelected && selectedCount > 1;

  return isBulkRemove
    ? t(`${translationNameSpace}.remove${axisKey}sTooltip`, { count: selectedCount })
    : t(`${translationNameSpace}.remove${axisKey}Tooltip`, { position: track.index + 1, total: trackCount });
};
