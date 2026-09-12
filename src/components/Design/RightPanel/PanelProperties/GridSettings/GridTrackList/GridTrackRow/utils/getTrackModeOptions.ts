import { TFunction } from 'i18next';

// others
import { roundTrackSize } from 'store/design/utils/autoLayout/gridTracks/roundTrackSize';
import { TRACK_MODE_OPTIONS } from 'store/design/utils/autoLayout/gridTracks/constants';
import { translationNameSpace } from '../../../constants';

// types
import { SizingMode } from 'types/design/enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TGridTrackViewModel } from '../../../hooks/types';

export const getTrackModeOptions = (t: TFunction, track: TGridTrackViewModel, axis: TGridTrackAxis): TDropdownOption<SizingMode>[] =>
  TRACK_MODE_OPTIONS[axis].map(({ icon, iconSize, labelKey, triggerLabel, value }) => ({
    icon,
    iconSize,
    label: t(`${translationNameSpace}.mode.${labelKey}`, {
      value: value === SizingMode.fixed ? roundTrackSize(track.resolvedSize) : track.value,
    }),
    triggerLabel,
    value,
  }));
