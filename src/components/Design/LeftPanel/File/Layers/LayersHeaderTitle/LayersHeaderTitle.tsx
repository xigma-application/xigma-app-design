import { FC } from 'react';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';

// components
import { Icon } from 'shared';

// others
import { LAYERS_TITLE_KEY } from '../constants';

// styles
import styles from './layers-header-title.module.scss';

export type TLayersHeaderTitleProps = {
  isExpanded: boolean;
};

const LayersHeaderTitle: FC<TLayersHeaderTitleProps> = ({ isExpanded }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.LayersHeaderTitle}>
      <div className={styles.LayersHeaderTitle__toggle} data-layers-toggle>
        <Icon
          className={cx(styles.LayersHeaderTitle__chevron, isExpanded && styles['LayersHeaderTitle__chevron--expanded'])}
          color="neutral2"
          name="ChevronRight"
          size={16}
        />
      </div>
      <span className={styles.LayersHeaderTitle__name}>{t(LAYERS_TITLE_KEY)}</span>
    </div>
  );
};

export default LayersHeaderTitle;
