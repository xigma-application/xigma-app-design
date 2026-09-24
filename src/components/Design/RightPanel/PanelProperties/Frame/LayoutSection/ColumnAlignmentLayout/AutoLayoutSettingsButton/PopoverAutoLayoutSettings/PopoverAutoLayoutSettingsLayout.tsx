import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PopoverAutoLayoutSettingsLayoutControl from './PopoverAutoLayoutSettingsLayoutControl/PopoverAutoLayoutSettingsLayoutControl';
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// types
import { TLayoutVersion } from './types';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export type TPopoverAutoLayoutSettingsLayoutProps = {
  onHoverOption: TFunc<[TLayoutVersion | null]>;
  onMouseEnter: TFunc;
  onMouseLeave: TFunc;
  onSelect: TFunc<[TLayoutVersion]>;
  options: TDropdownOption<TLayoutVersion>[];
  value: TLayoutVersion;
};

export const PopoverAutoLayoutSettingsLayout: FC<TPopoverAutoLayoutSettingsLayoutProps> = ({
  onHoverOption,
  onMouseEnter,
  onMouseLeave,
  onSelect,
  options,
  value,
}) => {
  const { t } = useTranslation();

  return (
    <UITools.Field
      Component={PopoverAutoLayoutSettingsLayoutControl}
      controlWidth={132}
      label={t(`${translationNameSpace}.layout.label`)}
      onHoverOption={onHoverOption}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onSelect={onSelect}
      options={options}
      value={value}
    />
  );
};

export default PopoverAutoLayoutSettingsLayout;
