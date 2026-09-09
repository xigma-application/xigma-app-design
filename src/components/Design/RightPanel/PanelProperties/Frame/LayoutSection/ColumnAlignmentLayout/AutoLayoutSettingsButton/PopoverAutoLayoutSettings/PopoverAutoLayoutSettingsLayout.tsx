import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PopoverAutoLayoutSettingsRow from './PopoverAutoLayoutSettingsRow/PopoverAutoLayoutSettingsRow';
import { Icon, Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './popover-auto-layout-settings.module.scss';

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
    <PopoverAutoLayoutSettingsRow label={t(`${translationNameSpace}.layout.label`)} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className={styles['PopoverAutoLayoutSettings__layout-options']}>
        <Tooltip
          content={
            <span className={styles['PopoverAutoLayoutSettings__tooltip-content']}>
              {t(`${translationNameSpace}.layout.infoTooltip`)}{' '}
              <span className={styles['PopoverAutoLayoutSettings__tooltip-link']}>
                {t(`${translationNameSpace}.layout.infoTooltipLink`)}
              </span>
            </span>
          }
        >
          <Icon name="Info" size={16} />
        </Tooltip>
        <UITools.Dropdown
          className={styles.PopoverAutoLayoutSettings__dropdown}
          onHoverOption={onHoverOption}
          onSelect={onSelect}
          options={options}
          value={value}
          variant="outline"
        />
      </div>
    </PopoverAutoLayoutSettingsRow>
  );
};

export default PopoverAutoLayoutSettingsLayout;
