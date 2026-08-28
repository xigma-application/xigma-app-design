import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon } from 'shared';

// others
import { translationNameSpace } from '../constants';

// store
import { selectActivePage } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './pages.module.scss';

const Pages: FC = () => {
  const { t } = useTranslation();
  const activePage = useAppSelector(selectActivePage);

  return (
    <div className={styles.Pages}>
      <div className={styles.Pages__toggle}>
        <Icon color="neutral2" name="ChevronRight" size={16} />
      </div>
      <span className={styles.Pages__name}>{activePage.name}</span>
      <div className={styles['Pages__button-group']}>
        <button aria-label={t(`${translationNameSpace}.pages.searchAriaLabel`)} className={styles.Pages__action} type="button">
          <Icon name="Search" size={24} />
        </button>
        <button aria-label={t(`${translationNameSpace}.pages.addAriaLabel`)} className={styles.Pages__action} type="button">
          <Icon name="Plus" size={24} />
        </button>
      </div>
    </div>
  );
};

export default Pages;
