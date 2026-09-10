// @xigma
import { TIconProps } from '@xigma/components';

// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export type TTrackModeOption = {
  icon: TIconProps['name'];
  iconSize: number;
  labelKey: string;
  triggerLabel: string;
  value: SizingMode;
};

export const TRACK_MODE_OPTIONS: Record<TGridTrackAxis, TTrackModeOption[]> = {
  column: [
    { icon: 'FixedWidth', iconSize: 24, labelKey: 'fixedWidth', triggerLabel: 'Fixed', value: SizingMode.fixed },
    { icon: 'AutoWidth', iconSize: 24, labelKey: 'hugContents', triggerLabel: 'Hug', value: SizingMode.hug },
    { icon: 'FillHorizontal', iconSize: 24, labelKey: 'fillContainer', triggerLabel: 'Fill', value: SizingMode.fill },
  ],
  row: [
    { icon: 'FixedHeight', iconSize: 24, labelKey: 'fixedHeight', triggerLabel: 'Fixed', value: SizingMode.fixed },
    { icon: 'AutoHeight', iconSize: 24, labelKey: 'hugContents', triggerLabel: 'Hug', value: SizingMode.hug },
    { icon: 'FillVertical', iconSize: 24, labelKey: 'fillContainer', triggerLabel: 'Fill', value: SizingMode.fill },
  ],
};
