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
    <PopoverAutoLayoutSettingsRow label={t(`${translationNameSpace}.${labelKey}`)} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
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

export default PopoverAutoLayoutSettingsInsideStroke;
