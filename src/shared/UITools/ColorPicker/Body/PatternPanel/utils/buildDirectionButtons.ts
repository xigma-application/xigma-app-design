import { TFunction } from 'i18next';

// types
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export const buildDirectionButtons = (t: TFunction): TToggleButton[] => [
  {
    ariaLabel: t('colorPicker.pattern.direction.horizontal'),
    icon: 'ArrowRight',
    tooltip: t('colorPicker.pattern.direction.horizontal'),
    value: 'horizontal',
  },
  {
    ariaLabel: t('colorPicker.pattern.direction.vertical'),
    icon: 'ArrowDown',
    tooltip: t('colorPicker.pattern.direction.vertical'),
    value: 'vertical',
  },
];
