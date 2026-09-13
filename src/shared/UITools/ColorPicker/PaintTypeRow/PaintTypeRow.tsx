import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// styles
import styles from './paint-type-row.module.scss';

export const PaintTypeRow: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.PaintTypeRow}>
      <Tooltip content={t('colorPicker.paintType.solid')}>
        <UITools.Button
          ariaLabel={t('colorPicker.paintType.solid')}
          className={cx(styles.PaintTypeRow__button, styles['PaintTypeRow__button--active'])}
          style={{ padding: 0 }}
        >
          <Icon name="Solid" size={24} />
        </UITools.Button>
      </Tooltip>
    </div>
  );
};

export default PaintTypeRow;
