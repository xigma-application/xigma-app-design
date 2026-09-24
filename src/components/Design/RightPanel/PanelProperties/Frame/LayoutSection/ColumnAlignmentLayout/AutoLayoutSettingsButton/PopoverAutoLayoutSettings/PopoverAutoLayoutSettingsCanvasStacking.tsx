import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
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
  value: TCanvasStacking | undefined;
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
      placeholder={MIXED_LABEL}
      value={value}
      variant="outline"
    />
  );
};

export default PopoverAutoLayoutSettingsCanvasStacking;
