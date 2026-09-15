import { FC } from 'react';
import cx from 'classnames';
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
        <Icon
          className={cx(styles.PagesHeaderTitle__chevron, isExpanded && styles['PagesHeaderTitle__chevron--expanded'])}
          color="neutral2"
          name="ChevronRight"
          size={16}
        />
      </div>
      <span className={styles.PagesHeaderTitle__name}>{label}</span>
    </div>
  );
};

export default PagesHeaderTitle;
