import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// types
import { TAlignTextBaseline } from './types';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export type TPopoverAutoLayoutSettingsAlignTextBaselineProps = {
  onChange: TFunc<[string]>;
  onHoverOption: TFunc<[string | null]>;
  onMouseEnter: TFunc;
  onMouseLeave: TFunc;
  toggleButtons: TToggleButton[];
  value: TAlignTextBaseline | undefined;
};

export const PopoverAutoLayoutSettingsAlignTextBaseline: FC<TPopoverAutoLayoutSettingsAlignTextBaselineProps> = ({
  onChange,
  onHoverOption,
  onMouseEnter,
  onMouseLeave,
  toggleButtons,
  value,
}) => {
  const { t } = useTranslation();

  return (
    <UITools.Field
      Component={UITools.ToggleButtonGroup}
      controlWidth={48}
      label={t(`${translationNameSpace}.alignTextBaseline.label`)}
      onChange={onChange}
      onHoverOption={onHoverOption}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      toggleButtons={toggleButtons}
      value={value ?? ''}
    />
  );
};

export default PopoverAutoLayoutSettingsAlignTextBaseline;
