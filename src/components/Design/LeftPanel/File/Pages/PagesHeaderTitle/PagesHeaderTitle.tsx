import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon } from 'shared';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './pages-header-title.module.scss';

export type TPagesHeaderTitleProps = {
  activePageName: string;
  isExpanded: boolean;
};

const PagesHeaderTitle: FC<TPagesHeaderTitleProps> = ({ activePageName, isExpanded }) => {
  const { t } = useTranslation();
  const label = isExpanded ? t(`${translationNameSpace}.title`) : activePageName;

  return (
    <div className={styles.PagesHeaderTitle}>
      <div className={styles.PagesHeaderTitle__toggle} data-page-toggle>
        <Icon color="neutral2" name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={16} />
      </div>
      <span className={styles.PagesHeaderTitle__name}>{label}</span>
    </div>
  );
};

export default PagesHeaderTitle;
