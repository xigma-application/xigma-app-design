import { TFunction } from 'i18next';

// others
import { IMAGE_FILL_MODES } from '../constants';

// types
import { TDropdownOption } from 'shared/UITools/Dropdown/types';
import { TImageFillMode } from '../types';

export const buildFillModeOptions = (t: TFunction, disabledFillModes: TImageFillMode[] = []): TDropdownOption<TImageFillMode>[] =>
  IMAGE_FILL_MODES.map((fillMode) => ({
    disabled: disabledFillModes.includes(fillMode) || undefined,
    label: t(`colorPicker.image.fillMode.${fillMode}`),
    value: fillMode,
  }));
