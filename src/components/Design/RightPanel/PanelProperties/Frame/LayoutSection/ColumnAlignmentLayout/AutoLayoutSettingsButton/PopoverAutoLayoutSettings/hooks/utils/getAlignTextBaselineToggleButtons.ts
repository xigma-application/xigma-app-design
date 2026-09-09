import { TFunction } from 'i18next';

// others
import { ALIGN_TEXT_BASELINE_VALUES, translationNameSpace } from '../../constants';

// types
import { AlignTextBaseline } from 'types/design/enums';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export const getAlignTextBaselineToggleButtons = (t: TFunction): TToggleButton[] =>
  ALIGN_TEXT_BASELINE_VALUES.map((value) => ({
    ariaLabel: t(`${translationNameSpace}.alignTextBaseline.option.${value}`),
    icon: value === AlignTextBaseline.on ? 'Check' : 'Minus',
    tooltip: t(`${translationNameSpace}.alignTextBaseline.tooltip.${value}`),
    value,
  }));
