import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PopoverAutoLayoutSettingsRow from './PopoverAutoLayoutSettingsRow/PopoverAutoLayoutSettingsRow';
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './popover-auto-layout-settings.module.scss';

// types
import { TAutoSpacing } from './types';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export type TPopoverAutoLayoutSettingsAutoSpacingProps = {
  onHoverOption: TFunc<[TAutoSpacing | null]>;
  onMouseEnter: TFunc;
  onMouseLeave: TFunc;
  onSelect: TFunc<[TAutoSpacing]>;
  options: TDropdownOption<TAutoSpacing>[];
  value: TAutoSpacing;
};

export const PopoverAutoLayoutSettingsAutoSpacing: FC<TPopoverAutoLayoutSettingsAutoSpacingProps> = ({
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
      disabled
      label={t(`${translationNameSpace}.autoSpacing.label`)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Tooltip content={t(`${translationNameSpace}.autoSpacing.disabledTooltip`)}>
        <span>
          <UITools.Dropdown
            className={styles.PopoverAutoLayoutSettings__dropdown}
            disabled
            onHoverOption={onHoverOption}
            onSelect={onSelect}
            options={options}
            value={value}
            variant="outline"
          />
        </span>
      </Tooltip>
    </PopoverAutoLayoutSettingsRow>
  );
};

export default PopoverAutoLayoutSettingsAutoSpacing;
