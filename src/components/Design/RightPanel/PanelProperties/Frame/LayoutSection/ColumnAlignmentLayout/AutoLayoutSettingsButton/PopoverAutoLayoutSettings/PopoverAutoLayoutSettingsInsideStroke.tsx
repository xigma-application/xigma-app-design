import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
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
  value: TInsideStroke | undefined;
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
      placeholder={MIXED_LABEL}
      value={value}
      variant="outline"
    />
  );
};

export default PopoverAutoLayoutSettingsInsideStroke;
