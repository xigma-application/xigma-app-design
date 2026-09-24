import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './popover-auto-layout-settings-layout-control.module.scss';

// types
import { TLayoutVersion } from '../types';
import { TDropdownProps } from 'shared/UITools/Dropdown/Dropdown';

export type TPopoverAutoLayoutSettingsLayoutControlProps = Pick<
  TDropdownProps<TLayoutVersion>,
  'onHoverOption' | 'onSelect' | 'options' | 'placeholder' | 'value'
> & { className?: string };

export const PopoverAutoLayoutSettingsLayoutControl: FC<TPopoverAutoLayoutSettingsLayoutControlProps> = ({
  className,
  onHoverOption,
  onSelect,
  options,
  placeholder,
  value,
}) => {
  const { t } = useTranslation();

  return (
    <div className={cx(styles.PopoverAutoLayoutSettingsLayoutControl, className)}>
      <Tooltip
        content={
          <span className={styles.PopoverAutoLayoutSettingsLayoutControl__tooltipContent}>
            {t(`${translationNameSpace}.layout.infoTooltip`)}{' '}
            <span className={styles.PopoverAutoLayoutSettingsLayoutControl__tooltipLink}>
              {t(`${translationNameSpace}.layout.infoTooltipLink`)}
            </span>
          </span>
        }
      >
        <Icon name="Info" size={16} />
      </Tooltip>
      <UITools.Dropdown<TLayoutVersion>
        className={styles.PopoverAutoLayoutSettingsLayoutControl__dropdown}
        onHoverOption={onHoverOption}
        onSelect={onSelect}
        options={options}
        placeholder={placeholder}
        value={value}
        variant="outline"
      />
    </div>
  );
};

export default PopoverAutoLayoutSettingsLayoutControl;
