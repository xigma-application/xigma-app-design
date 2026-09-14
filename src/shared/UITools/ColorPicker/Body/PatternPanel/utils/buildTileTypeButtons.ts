import { TFunction } from 'i18next';

// types
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export const buildTileTypeButtons = (t: TFunction): TToggleButton[] => [
  {
    ariaLabel: t('colorPicker.pattern.tileType.rectangular'),
    icon: 'RectangularPattern',
    tooltip: t('colorPicker.pattern.tileType.rectangular'),
    value: 'rectangular',
  },
  {
    ariaLabel: t('colorPicker.pattern.tileType.hexagonal'),
    icon: 'CircularPattern',
    tooltip: t('colorPicker.pattern.tileType.hexagonal'),
    value: 'hexagonal',
  },
];
