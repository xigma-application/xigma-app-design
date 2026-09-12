import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from '../../../../constants';

// styles
import styles from './corner-smoothing-popover-header.module.scss';

export type TCornerSmoothingPopoverHeaderProps = {
  onClose: TFunc;
};

export const CornerSmoothingPopoverHeader: FC<TCornerSmoothingPopoverHeaderProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.CornerSmoothingPopoverHeader}>
      <span className={styles.CornerSmoothingPopoverHeader__title}>{t(`${translationNameSpace}.cornerRadius.smoothingHeader`)}</span>
      <Tooltip content={t('common.close')}>
        <UITools.Button
          ariaLabel={t('common.close')}
          className={styles.CornerSmoothingPopoverHeader__close}
          onClick={onClose}
          style={{ padding: 0 }}
        >
          <Icon name="Close" size={22} />
        </UITools.Button>
      </Tooltip>
    </div>
  );
};

export default CornerSmoothingPopoverHeader;
