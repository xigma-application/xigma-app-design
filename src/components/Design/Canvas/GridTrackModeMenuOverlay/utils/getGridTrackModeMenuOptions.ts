import { TFunction } from 'i18next';

// @xigma
import { TIconProps } from '@xigma/components';

// others
import { translationNameSpace } from 'components/Design/RightPanel/PanelProperties/GridSettings/constants';

// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { roundTrackSize } from 'store/design/utils/autoLayout/gridTracks/roundTrackSize';
import { TRACK_MODE_OPTIONS } from 'store/design/utils/autoLayout/gridTracks/constants';

export type TGridTrackModeMenuOption = {
  icon: TIconProps['name'];
  iconSize: number;
  label: string;
  value: SizingMode;
};

export const getGridTrackModeMenuOptions = (
  t: TFunction,
  axis: TGridTrackAxis,
  resolvedSize: number,
  trackValue: number | undefined,
): TGridTrackModeMenuOption[] =>
  TRACK_MODE_OPTIONS[axis].map(({ icon, iconSize, labelKey, value }) => ({
    icon,
    iconSize,
    label: t(`${translationNameSpace}.mode.${labelKey}`, {
      value: value === SizingMode.fixed ? roundTrackSize(resolvedSize) : (trackValue ?? 1),
    }),
    value,
  }));
