import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// styles
import styles from './not-found-page.module.scss';

const NotFoundPage: FC = () => {
  const { t } = useTranslation();

  return (
    <main className={styles.NotFoundPage}>
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.description')}</p>
    </main>
  );
};

export default NotFoundPage;
