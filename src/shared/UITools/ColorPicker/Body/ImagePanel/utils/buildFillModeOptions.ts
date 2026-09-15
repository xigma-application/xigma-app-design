import { TFunction } from 'i18next';

// types
import { TDropdownOption } from 'shared/UITools/Dropdown/types';
import { TImageFillMode } from '../types';

export const buildFillModeOptions = (t: TFunction): TDropdownOption<TImageFillMode>[] => [
  { label: t('colorPicker.image.fillMode.fill'), value: 'fill' },
  { label: t('colorPicker.image.fillMode.fit'), value: 'fit' },
  { label: t('colorPicker.image.fillMode.crop'), value: 'crop' },
  { label: t('colorPicker.image.fillMode.tile'), value: 'tile' },
];
