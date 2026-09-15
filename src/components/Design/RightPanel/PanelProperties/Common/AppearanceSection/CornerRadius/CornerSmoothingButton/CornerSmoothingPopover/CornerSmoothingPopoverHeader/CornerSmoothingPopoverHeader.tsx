import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

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
        <UITools.ButtonIcon
          ariaLabel={t('common.close')}
          className={styles.CornerSmoothingPopoverHeader__close}
          name="Close"
          onClick={onClose}
        />
      </Tooltip>
    </div>
  );
};

export default CornerSmoothingPopoverHeader;
