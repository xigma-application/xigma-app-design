import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// types
import { TCanvasStacking } from './types';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export type TPopoverAutoLayoutSettingsCanvasStackingProps = {
  onHoverOption: TFunc<[TCanvasStacking | null]>;
  onMouseEnter: TFunc;
  onMouseLeave: TFunc;
  onSelect: TFunc<[TCanvasStacking]>;
  options: TDropdownOption<TCanvasStacking>[];
  value: TCanvasStacking;
};

export const PopoverAutoLayoutSettingsCanvasStacking: FC<TPopoverAutoLayoutSettingsCanvasStackingProps> = ({
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
      Component={UITools.Dropdown<TCanvasStacking>}
      controlWidth={112}
      label={t(`${translationNameSpace}.canvasStacking.label`)}
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

export default PopoverAutoLayoutSettingsCanvasStacking;
