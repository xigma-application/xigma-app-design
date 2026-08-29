import { FC } from 'react';
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
        <Icon color="neutral2" name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={16} />
      </div>
      <span className={styles.LayersHeaderTitle__name}>{t(LAYERS_TITLE_KEY)}</span>
    </div>
  );
};

export default LayersHeaderTitle;
