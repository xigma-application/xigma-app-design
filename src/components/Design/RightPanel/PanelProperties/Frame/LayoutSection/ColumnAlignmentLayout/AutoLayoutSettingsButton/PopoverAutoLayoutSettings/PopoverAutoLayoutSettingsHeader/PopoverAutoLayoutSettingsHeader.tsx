import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

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
        <UITools.Button
          ariaLabel={t('common.close')}
          className={styles.PopoverAutoLayoutSettingsHeader__close}
          onClick={onClose}
          style={{ padding: 0 }}
        >
          <Icon name="Close" size={22} />
        </UITools.Button>
      </Tooltip>
    </div>
  );
};

export default PopoverAutoLayoutSettingsHeader;
