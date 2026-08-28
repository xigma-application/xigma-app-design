import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Chip } from 'shared';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './file-meta.module.scss';

const FileMeta: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.FileMeta}>
      <button className={styles.FileMeta__drafts} type="button">
        {t(`${translationNameSpace}.drafts`)}
      </button>
      <Chip variant="free">{t(`${translationNameSpace}.subscription.free`)}</Chip>
    </div>
  );
};

export default FileMeta;
