import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './popover-auto-layout-settings-header.module.scss';

export type TPopoverAutoLayoutSettingsHeaderProps = {
  onClose: TFunc;
};

export const PopoverAutoLayoutSettingsHeader: FC<TPopoverAutoLayoutSettingsHeaderProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.PopoverAutoLayoutSettingsHeader}>
      <span className={styles.PopoverAutoLayoutSettingsHeader__title}>{t(`${translationNameSpace}.header`)}</span>
      <Tooltip content={t('common.close')}>
        <UITools.ButtonIcon
          ariaLabel={t('common.close')}
          className={styles.PopoverAutoLayoutSettingsHeader__close}
          name="Close"
          onClick={onClose}
        />
      </Tooltip>
    </div>
  );
};

export default PopoverAutoLayoutSettingsHeader;
