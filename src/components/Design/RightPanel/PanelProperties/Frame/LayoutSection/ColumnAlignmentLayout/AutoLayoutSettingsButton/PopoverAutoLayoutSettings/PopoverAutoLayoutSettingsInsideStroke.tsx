import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// types
import { TInsideStroke } from './types';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export type TPopoverAutoLayoutSettingsInsideStrokeProps = {
  isLegacyLayout: boolean;
  onHoverOption: TFunc<[TInsideStroke | null]>;
  onMouseEnter: TFunc;
  onMouseLeave: TFunc;
  onSelect: TFunc<[TInsideStroke]>;
  options: TDropdownOption<TInsideStroke>[];
  value: TInsideStroke;
};

export const PopoverAutoLayoutSettingsInsideStroke: FC<TPopoverAutoLayoutSettingsInsideStrokeProps> = ({
  isLegacyLayout,
  onHoverOption,
  onMouseEnter,
  onMouseLeave,
  onSelect,
  options,
  value,
}) => {
  const { t } = useTranslation();
  const labelKey = isLegacyLayout ? 'insideStroke.legacyLabel' : 'insideStroke.label';

  return (
    <UITools.Field
      Component={UITools.Dropdown<TInsideStroke>}
      controlWidth={112}
      label={t(`${translationNameSpace}.${labelKey}`)}
      onHoverOption={onHoverOption}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onSelect={onSelect}
      options={options}
      value={value}
      variant="outline"
    />
  );
};

export default PopoverAutoLayoutSettingsInsideStroke;
