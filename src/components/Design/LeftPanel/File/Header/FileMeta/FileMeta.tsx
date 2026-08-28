import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { noop } from 'lodash';

// components
import { Chip } from 'shared';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from './file-meta.module.scss';

const FileMeta: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.FileMeta}>
      <Chip onClick={noop} variant="secondary">
        {t(`${translationNameSpace}.drafts`)}
      </Chip>
      <Chip variant="free">{t(`${translationNameSpace}.subscription.free`)}</Chip>
    </div>
  );
};

export default FileMeta;
