import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PopoverAutoLayoutSettingsRow from './PopoverAutoLayoutSettingsRow/PopoverAutoLayoutSettingsRow';
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './popover-auto-layout-settings.module.scss';

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
    <PopoverAutoLayoutSettingsRow
      label={t(`${translationNameSpace}.canvasStacking.label`)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <UITools.Dropdown
        className={styles.PopoverAutoLayoutSettings__dropdown}
        onHoverOption={onHoverOption}
        onSelect={onSelect}
        options={options}
        value={value}
        variant="outline"
      />
    </PopoverAutoLayoutSettingsRow>
  );
};

export default PopoverAutoLayoutSettingsCanvasStacking;
