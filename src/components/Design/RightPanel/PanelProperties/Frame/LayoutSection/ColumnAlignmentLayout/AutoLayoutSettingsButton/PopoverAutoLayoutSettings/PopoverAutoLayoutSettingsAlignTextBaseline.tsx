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
import { TAlignTextBaseline } from './types';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export type TPopoverAutoLayoutSettingsAlignTextBaselineProps = {
  onChange: TFunc<[string]>;
  onHoverOption: TFunc<[string | null]>;
  onMouseEnter: TFunc;
  onMouseLeave: TFunc;
  toggleButtons: TToggleButton[];
  value: TAlignTextBaseline;
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
    <PopoverAutoLayoutSettingsRow
      label={t(`${translationNameSpace}.alignTextBaseline.label`)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <UITools.ToggleButtonGroup
        className={styles.PopoverAutoLayoutSettings__toggle}
        onChange={onChange}
        onHoverOption={onHoverOption}
        toggleButtons={toggleButtons}
        value={value}
      />
    </PopoverAutoLayoutSettingsRow>
  );
};

export default PopoverAutoLayoutSettingsAlignTextBaseline;
